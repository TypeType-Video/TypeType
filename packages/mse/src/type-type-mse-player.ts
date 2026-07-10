import { decodeStartMs, runDecodePreroll } from "./decode-preroll";
import { EventEmitter } from "./event-emitter";
import { PlaybackIntent } from "./playback-intent";
import { createPlayerDeps, type PlayerDeps } from "./player-deps";
import { emitManifest, emitQuality } from "./player-events";
import { ensureCurrentOperation, ensurePlayerAlive } from "./player-operation";
import { loadPlayerSession } from "./player-session-loader";
import { createSnapshot, currentTimeMs, type TypeTypeMseSnapshot } from "./player-snapshot";
import { PlayerState } from "./player-state";
import { SeekController } from "./seek-controller";
import type { LoadedSession } from "./session-loader";
import type {
  TypeTypeMseConfig,
  TypeTypeMseEventType,
  TypeTypeMseListener,
  TypeTypeMseQuality,
} from "./types";

export class TypeTypeMsePlayer {
  private readonly emitter = new EventEmitter();
  private readonly deps: PlayerDeps;
  private readonly playerState = new PlayerState(this.emitter);
  private readonly playbackIntent = new PlaybackIntent();
  private readonly seekController = new SeekController();
  private session: LoadedSession | null = null;
  private operation = new AbortController();
  private revision = 0;
  private destroyed = false;

  constructor(
    private readonly video: HTMLVideoElement,
    private readonly config: TypeTypeMseConfig,
  ) {
    this.deps = createPlayerDeps({
      video,
      config,
      emitter: this.emitter,
      session: () => this.session,
      signal: () => this.operation.signal,
      state: (state) => this.playerState.set(state),
      error: (error) => {
        if (!this.destroyed) this.playerState.fail(error);
      },
    });
    this.deps.mediaEvents.start();
  }
  on(type: TypeTypeMseEventType, listener: TypeTypeMseListener): () => void {
    return this.emitter.on(type, listener);
  }

  async load(): Promise<void> {
    ensurePlayerAlive(this.destroyed);
    const revision = this.nextRevision();
    const signal = this.operation.signal;
    this.playerState.set("loading");
    const startTimeMs = Math.max(0, Math.round(this.config.startTimeMs ?? 0));
    const response = await this.deps.playback.create(
      {
        videoId: this.config.videoId,
        videoItag: this.config.videoItag,
        audioItag: this.config.audioItag,
        audioTrackId: this.config.audioTrackId,
        startTimeMs,
      },
      signal,
    );
    await this.switchSession(response, startTimeMs, revision, signal);
  }
  async play(): Promise<void> {
    ensurePlayerAlive(this.destroyed);
    this.playbackIntent.play();
    await this.video.play();
    this.playerState.set("playing");
  }

  pause(): void {
    this.playbackIntent.pause();
    this.video.pause();
    this.playerState.set("ready");
  }
  async seek(positionMs: number): Promise<void> {
    this.playbackIntent.capture(this.video.paused, this.playerState.value === "seeking");
    const targetMs = Math.max(0, Math.round(positionMs));
    return this.seekController.seek(
      targetMs,
      `seek:${targetMs}`,
      (target) => this.performSeek(target),
      () => this.operation.abort(),
    );
  }

  async setQuality(quality: TypeTypeMseQuality): Promise<void> {
    this.playbackIntent.capture(this.video.paused, this.playerState.value === "seeking");
    const targetMs = currentTimeMs(this.video);
    const key = `quality:${targetMs}:${quality.videoItag}:${quality.audioItag}:${quality.audioTrackId ?? ""}`;
    return this.seekController.seek(
      targetMs,
      key,
      (target) => this.performSeek(target, quality),
      () => this.operation.abort(),
    );
  }

  snapshot(): TypeTypeMseSnapshot {
    return createSnapshot(this.video, this.playerState.value, this.session);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.operation.abort();
    this.seekController.reset();
    this.deps.destroy();
    this.emitter.clear();
    this.playerState.destroy();
  }

  private async performSeek(positionMs: number, quality?: TypeTypeMseQuality): Promise<void> {
    ensurePlayerAlive(this.destroyed);
    const current = this.session;
    if (!current) throw new Error("Player is not loaded");
    const revision = this.nextRevision();
    const signal = this.operation.signal;
    const targetMs = Math.max(0, Math.round(positionMs));
    this.deps.loop.stop();
    this.playerState.set("seeking");
    this.emitter.emit({ type: "seek", positionMs: targetMs });
    try {
      const response = await this.deps.playback.seek(
        current.response.sessionId,
        targetMs,
        quality,
        signal,
      );
      const session = await this.switchSession(response, targetMs, revision, signal, quality);
      if (quality) emitQuality(this.emitter, session);
    } catch (error) {
      if (!this.destroyed && this.session === current) {
        this.deps.loop.start();
        this.playerState.set(this.video.paused ? "ready" : "playing");
      }
      throw error;
    }
  }

  private async switchSession(
    response: LoadedSession["response"],
    startTimeMs: number,
    revision: number,
    signal: AbortSignal,
    quality?: TypeTypeMseQuality,
  ): Promise<LoadedSession> {
    const session = await loadPlayerSession({
      deps: this.deps,
      config: this.config,
      video: this.video,
      response,
      current: this.session,
      quality,
      startTimeMs,
      signal,
    });
    ensureCurrentOperation(this.destroyed, this.revision, revision);
    const startMs = decodeStartMs(session.manifest, startTimeMs);
    if (startTimeMs > 0) this.video.currentTime = startMs / 1000;
    this.session = session;
    await this.deps.loop.fillOnce();
    if (startTimeMs > startMs) {
      await runDecodePreroll(this.video, startTimeMs, this.playbackIntent.shouldResume, signal);
    }
    this.deps.loop.start();
    emitManifest(this.emitter, session.response, session);
    this.playerState.set("ready");
    return session;
  }

  private nextRevision(): number {
    this.operation.abort();
    this.operation = new AbortController();
    this.revision += 1;
    return this.revision;
  }
}
