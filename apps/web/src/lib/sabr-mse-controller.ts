import type { SabrSessionDescriptor, SabrSourceConfig } from "../types/sabr";
import { appendSabrInitSegment } from "./sabr-init-segment";
import {
  appendChunks,
  bufferedAhead,
  type SabrTrackState,
  wait,
  waitForSourceOpen,
} from "./sabr-mse-utils";
import {
  sabrBufferedPumpTimeMs,
  sabrPlaybackMessage,
  sabrPlayerTimeMs,
} from "./sabr-playback-message";
import { connectSabrSession } from "./sabr-session-connection";
import { createSabrTrack } from "./sabr-track-state";
import type { SabrWebSocketClient } from "./sabr-websocket-client";

type Args = {
  media: HTMLVideoElement;
  config: SabrSourceConfig;
  autoplay: boolean;
  onError: () => void;
};

const BUFFER_TARGET_SEC = 24;

export class SabrMseController {
  private readonly mediaSource = new MediaSource();
  private readonly objectUrl = URL.createObjectURL(this.mediaSource);
  private audio: SabrTrackState | null = null;
  private video: SabrTrackState | null = null;
  private client: SabrWebSocketClient | null = null;
  private generation = 0;
  private disposed = false;
  private failed = false;
  private requestId = 0;
  private readonly args: Args;

  constructor(args: Args) {
    this.args = args;
  }
  start(): void {
    this.args.media.src = this.objectUrl;
    this.args.media.addEventListener("seeking", this.handleSeeking);
    this.args.media.addEventListener("error", this.handleMediaError);
    void this.initialize();
  }
  dispose(): void {
    this.disposed = true;
    this.generation += 1;
    this.client?.close();
    this.args.media.removeEventListener("seeking", this.handleSeeking);
    this.args.media.removeEventListener("error", this.handleMediaError);
    this.audio?.queue.clear();
    this.video?.queue.clear();
    this.args.media.removeAttribute("src");
    this.args.media.load();
    URL.revokeObjectURL(this.objectUrl);
  }
  private async initialize(): Promise<void> {
    const generation = this.generation;
    try {
      if (typeof MediaSource === "undefined") throw new Error("mse_unavailable");
      await waitForSourceOpen(this.mediaSource);
      if (!this.active(generation)) return;
      const descriptor = await this.connectSession(generation, sabrPlayerTimeMs(this.args.media));
      this.mediaSource.duration = descriptor.durationMs / 1000;
      const video = createSabrTrack(this.mediaSource, descriptor.video);
      const audio = createSabrTrack(this.mediaSource, descriptor.audio);
      this.video = video;
      this.audio = audio;
      await appendSabrInitSegment(video, descriptor.endpoints.videoInit, () =>
        this.active(generation),
      );
      await appendSabrInitSegment(audio, descriptor.endpoints.audioInit, () =>
        this.active(generation),
      );
      this.sendState(generation);
      void this.pump(generation);
    } catch {
      this.fail();
    }
  }
  private async connectSession(
    generation: number,
    playerTimeMs: number,
  ): Promise<SabrSessionDescriptor> {
    const { descriptor, client } = await connectSabrSession(
      this.args.config.descriptorUrl,
      playerTimeMs,
    );
    if (!this.active(generation)) {
      client.close();
      throw new Error("sabr_generation_stale");
    }
    this.client = client;
    return descriptor;
  }
  private async pump(generation: number): Promise<void> {
    while (!this.disposed && generation === this.generation) {
      try {
        if (bufferedAhead(this.args.media) >= BUFFER_TARGET_SEC) {
          await wait(400);
          continue;
        }
        if (!this.video?.queue.idle() || !this.audio?.queue.idle()) {
          await wait(20);
          continue;
        }
        await this.appendSegments(generation);
        if (this.args.autoplay && this.args.media.paused && bufferedAhead(this.args.media) > 1) {
          await this.args.media.play().catch(() => undefined);
        }
        await wait(20);
      } catch {
        if (generation === this.generation) this.fail();
        return;
      }
    }
  }
  private async appendSegments(generation: number): Promise<void> {
    const client = this.client;
    if (!this.video || !this.audio || !client) return;
    const chunks = await client.request(
      this.message("pump", generation, sabrBufferedPumpTimeMs(this.args.media)),
    );
    if (!this.active(generation)) return;
    appendChunks(this.video, chunks);
    appendChunks(this.audio, chunks);
    this.video.queue.removeBefore(this.args.media.currentTime);
    this.audio.queue.removeBefore(this.args.media.currentTime);
  }
  private readonly handleSeeking = (): void => {
    if (this.disposed || this.failed) return;
    this.generation += 1;
    this.video?.queue.clear();
    this.audio?.queue.clear();
    this.client?.close();
    this.client = null;
    void this.reconnect(this.generation);
  };
  private async reconnect(generation: number): Promise<void> {
    try {
      await this.connectSession(generation, sabrPlayerTimeMs(this.args.media));
      this.sendState(generation);
      void this.pump(generation);
    } catch {
      if (generation === this.generation) this.fail();
    }
  }
  private readonly handleMediaError = (): void => this.fail();
  private sendState(generation: number): void {
    this.client?.send(this.message("state", generation));
  }

  private message(type: "state" | "pump", generation: number, playerTimeMs?: number) {
    if (!this.video || !this.audio) throw new Error("sabr_tracks_missing");
    this.requestId += 1;
    return sabrPlaybackMessage(
      type,
      `${type}-${generation}-${this.requestId}`,
      this.args.media,
      this.video,
      this.audio,
      playerTimeMs,
    );
  }
  private active(generation: number): boolean {
    return !this.disposed && generation === this.generation;
  }
  private fail(): void {
    if (this.disposed || this.failed) return;
    this.failed = true;
    this.client?.close();
    this.args.onError();
  }
}
