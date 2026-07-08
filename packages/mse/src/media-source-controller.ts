import { AppendQueue } from "./append-queue";
import type { ManifestTrack, PlaybackManifest } from "./manifest";
import type { TrackKind } from "./types";

export class MediaSourceController {
  private objectUrl: string | null = null;
  private audioQueue: AppendQueue | null = null;
  private videoQueue: AppendQueue | null = null;

  constructor(private readonly video: HTMLVideoElement) {}

  static supported(manifest: PlaybackManifest): boolean {
    return (
      MediaSource.isTypeSupported(manifest.audio.mime) &&
      MediaSource.isTypeSupported(manifest.video.mime)
    );
  }

  async attach(manifest: PlaybackManifest): Promise<void> {
    this.detach();
    const mediaSource = new MediaSource();
    this.objectUrl = URL.createObjectURL(mediaSource);
    this.video.src = this.objectUrl;
    await new Promise<void>((resolve) => {
      mediaSource.addEventListener("sourceopen", () => resolve(), { once: true });
    });
    mediaSource.duration = manifest.durationMs > 0 ? manifest.durationMs / 1000 : Number.NaN;
    this.audioQueue = new AppendQueue(mediaSource.addSourceBuffer(manifest.audio.mime));
    this.videoQueue = new AppendQueue(mediaSource.addSourceBuffer(manifest.video.mime));
  }

  append(kind: TrackKind, data: ArrayBuffer): Promise<void> {
    const queue = kind === "audio" ? this.audioQueue : this.videoQueue;
    if (!queue) return Promise.reject(new Error(`${kind} SourceBuffer is not ready`));
    return queue.append(data);
  }

  async trim(currentTimeMs: number, backBufferMs: number): Promise<void> {
    const removeEnd = Math.max(0, currentTimeMs - backBufferMs) / 1000;
    await Promise.all([
      this.audioQueue?.remove(0, removeEnd),
      this.videoQueue?.remove(0, removeEnd),
    ]);
  }

  clear(): void {
    this.audioQueue?.clear();
    this.videoQueue?.clear();
  }

  detach(): void {
    this.audioQueue?.destroy();
    this.videoQueue?.destroy();
    this.audioQueue = null;
    this.videoQueue = null;
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = null;
    this.video.removeAttribute("src");
    this.video.load();
  }

  track(kind: TrackKind, manifest: PlaybackManifest): ManifestTrack {
    return kind === "audio" ? manifest.audio : manifest.video;
  }
}
