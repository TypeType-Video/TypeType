import type { BufferPolicy } from "./buffer-policy";
import type { EventEmitter } from "./event-emitter";
import type { HttpClient } from "./http-client";
import type { MediaSourceController } from "./media-source-controller";
import type { PlaybackClient } from "./playback-client";
import { currentTimeMs } from "./player-snapshot";
import type { SegmentScheduler } from "./segment-scheduler";
import type { LoadedSession } from "./session-loader";
import { refreshPlaybackWindow } from "./session-loader";

type PlaybackLoopArgs = {
  video: HTMLVideoElement;
  http: HttpClient;
  playback: PlaybackClient;
  media: MediaSourceController;
  scheduler: SegmentScheduler;
  emitter: EventEmitter;
  policy: BufferPolicy;
  session: () => LoadedSession | null;
  signal: () => AbortSignal;
  bufferedEndMs: () => number;
  error: (error: Error) => void;
};

export class PlaybackLoop {
  private fillTimer: ReturnType<typeof setInterval> | null = null;
  private manifestTimer: ReturnType<typeof setInterval> | null = null;
  private filling = false;

  constructor(private readonly args: PlaybackLoopArgs) {}

  start(): void {
    this.stop();
    this.fillTimer = setInterval(
      () => void this.fillOnce().catch((error) => this.args.error(error)),
      this.args.policy.pollIntervalMs,
    );
    this.manifestTimer = setInterval(
      () => void this.refreshManifest().catch((error) => this.args.error(error)),
      this.args.policy.manifestRefreshMs,
    );
  }

  stop(): void {
    if (this.fillTimer) clearInterval(this.fillTimer);
    if (this.manifestTimer) clearInterval(this.manifestTimer);
    this.fillTimer = null;
    this.manifestTimer = null;
  }

  async fillOnce(): Promise<void> {
    const session = this.args.session();
    if (!session || this.filling) return;
    this.filling = true;
    try {
      const currentMs = currentTimeMs(this.args.video);
      const goalMs = currentMs + this.args.policy.bufferGoalMs;
      await this.args.scheduler.fill(session.manifest, currentMs, goalMs, this.args.signal());
      await this.args.media.trim(currentMs, this.args.policy.backBufferMs);
      this.args.emitter.emit({
        type: "buffer",
        currentTimeMs: currentMs,
        bufferedEndMs: this.args.bufferedEndMs(),
      });
    } finally {
      this.filling = false;
    }
  }

  private async refreshManifest(): Promise<void> {
    const session = this.args.session();
    if (!session) return;
    await refreshPlaybackWindow(
      this.args.playback,
      this.args.media,
      session,
      this.args.policy,
      currentTimeMs(this.args.video),
      this.args.signal(),
    );
  }
}
