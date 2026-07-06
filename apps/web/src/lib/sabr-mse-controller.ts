import type { SabrMseControllerArgs } from "../types/sabr";
import { appendSabrInitSegment } from "./sabr-init-segment";
import {
  appendChunks,
  BUFFER_TARGET_SEC,
  bufferedAhead,
  canReconnectWaiting,
  disposeMediaSource,
  initialSeekPlayerTimeMs,
  type SabrTrackState,
  seekToInitialRange,
  wait,
  waitForSourceOpen,
} from "./sabr-mse-utils";
import {
  sabrBufferedPumpTimeMs,
  sabrInitialPlayerTimeMs,
  sabrPlaybackMessage,
  sabrPlayerTimeMs,
} from "./sabr-playback-message";
import { connectActiveSabrSession } from "./sabr-session-connection";
import { createSabrTrack } from "./sabr-track-state";
import type { SabrWebSocketClient } from "./sabr-websocket-client";

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
  private lastWaitingReconnectMs = 0;
  private initialSeekTimeSec: number | null = null;
  private readonly args: SabrMseControllerArgs;

  constructor(args: SabrMseControllerArgs) {
    this.args = args;
  }
  start(): void {
    this.args.media.src = this.objectUrl;
    this.args.media.addEventListener("waiting", this.handleWaiting);
    this.args.media.addEventListener("error", this.handleMediaError);
    void this.initialize();
  }
  dispose(): void {
    this.disposed = true;
    this.generation += 1;
    this.client?.close();
    this.args.media.removeEventListener("seeking", this.handleSeeking);
    this.args.media.removeEventListener("waiting", this.handleWaiting);
    this.args.media.removeEventListener("error", this.handleMediaError);
    this.audio?.queue.clear();
    this.video?.queue.clear();
    disposeMediaSource(this.args.media, this.objectUrl);
  }
  private async initialize(): Promise<void> {
    const generation = this.generation;
    try {
      if (typeof MediaSource === "undefined") throw new Error("mse_unavailable");
      await waitForSourceOpen(this.mediaSource);
      if (!this.active(generation)) return;
      const isActive = () => this.active(generation);
      const playerTimeMs = sabrInitialPlayerTimeMs(this.args.media, this.args.startTime);
      const { descriptor, client } = await connectActiveSabrSession(
        this.args.config.descriptorUrl,
        playerTimeMs,
        isActive,
      );
      this.client = client;
      this.mediaSource.duration = descriptor.durationMs / 1000;
      const video = createSabrTrack(this.mediaSource, descriptor.video);
      const audio = createSabrTrack(this.mediaSource, descriptor.audio);
      this.video = video;
      this.audio = audio;
      await appendSabrInitSegment(video, descriptor.endpoints.videoInit, isActive);
      await appendSabrInitSegment(audio, descriptor.endpoints.audioInit, isActive);
      this.initialSeekTimeSec = descriptor.startTimeMs > 0 ? descriptor.startTimeMs / 1000 : null;
      this.args.media.addEventListener("seeking", this.handleSeeking);
      this.sendState(generation);
      void this.pump(generation);
    } catch {
      this.fail();
    }
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
        const initialSeek = seekToInitialRange(this.args.media, this.initialSeekTimeSec);
        if (initialSeek !== "missing") {
          if (initialSeek === "settled") this.initialSeekTimeSec = null;
          await wait(initialSeek === "settled" ? 20 : 100);
          continue;
        }
        await this.appendSegments(generation);
        if (this.args.autoplay && this.args.media.paused && bufferedAhead(this.args.media) > 1) {
          await this.args.media.play().catch(() => undefined);
        }
        await wait(20);
      } catch {
        if (generation !== this.generation) return;
        this.client?.close();
        this.client = null;
        if (bufferedAhead(this.args.media) <= 1) this.fail();
        else void this.reconnect(generation);
        return;
      }
    }
  }
  private async appendSegments(generation: number): Promise<void> {
    const client = this.client;
    if (!this.video || !this.audio || !client) return;
    const playerTimeMs =
      initialSeekPlayerTimeMs(this.initialSeekTimeSec) ?? sabrBufferedPumpTimeMs(this.args.media);
    const chunks = await client.request(this.message("pump", generation, playerTimeMs));
    if (!this.active(generation)) return;
    appendChunks(this.video, chunks);
    appendChunks(this.audio, chunks);
    this.video.queue.removeBefore(this.args.media.currentTime);
    this.audio.queue.removeBefore(this.args.media.currentTime);
  }
  private readonly handleSeeking = (): void => {
    if (this.disposed || this.failed || this.initialSeekTimeSec !== null) return;
    this.generation += 1;
    this.video?.queue.clear();
    this.audio?.queue.clear();
    this.client?.close();
    this.client = null;
    void this.reconnect(this.generation);
  };
  private async reconnect(generation: number): Promise<void> {
    try {
      const { client } = await connectActiveSabrSession(
        this.args.config.descriptorUrl,
        initialSeekPlayerTimeMs(this.initialSeekTimeSec) ?? sabrPlayerTimeMs(this.args.media),
        () => this.active(generation),
      );
      this.client = client;
      this.sendState(generation);
      void this.pump(generation);
    } catch {
      if (generation === this.generation && bufferedAhead(this.args.media) <= 1) this.fail();
    }
  }
  private readonly handleMediaError = (): void => this.fail();
  private readonly handleWaiting = (): void => {
    if (this.disposed || this.failed) return;
    if (!canReconnectWaiting(this.args.media, this.video, this.audio, this.initialSeekTimeSec))
      return;
    const now = Date.now();
    if (now - this.lastWaitingReconnectMs < 1000) return;
    this.lastWaitingReconnectMs = now;
    this.handleSeeking();
  };
  private sendState(generation: number): void {
    const playerTimeMs = initialSeekPlayerTimeMs(this.initialSeekTimeSec);
    this.client?.send(this.message("state", generation, playerTimeMs));
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
