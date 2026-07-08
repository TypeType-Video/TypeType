import { AppendQueue } from "./append-queue";
import type { ManifestTrack, PlaybackManifest } from "./manifest";
import type { TrackKind } from "./types";

export type MediaBufferedRange = {
  kind: TrackKind;
  startMs: number;
  endMs: number;
};

export class MediaSourceController {
  private objectUrl: string | null = null;
  private audioQueue: AppendQueue | null = null;
  private videoQueue: AppendQueue | null = null;
  private mediaSource: MediaSource | null = null;

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
    this.mediaSource = mediaSource;
    this.objectUrl = URL.createObjectURL(mediaSource);
    this.video.src = this.objectUrl;
    await new Promise<void>((resolve, reject) => {
      const sourceOpen = () => resolve();
      const sourceClose = () => reject(new DOMException("Operation aborted", "AbortError"));
      mediaSource.addEventListener("sourceopen", sourceOpen, { once: true });
      mediaSource.addEventListener("sourceclose", sourceClose, { once: true });
    });
    if (this.mediaSource !== mediaSource) throw new DOMException("Operation aborted", "AbortError");
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

  bufferedRanges(): MediaBufferedRange[] {
    return [
      ...this.queueRanges("audio", this.audioQueue),
      ...this.queueRanges("video", this.videoQueue),
    ];
  }

  detach(): void {
    this.audioQueue?.destroy();
    this.videoQueue?.destroy();
    const hadObjectUrl = this.objectUrl !== null;
    this.audioQueue = null;
    this.videoQueue = null;
    this.mediaSource = null;
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = null;
    this.video.removeAttribute("src");
    if (hadObjectUrl) this.video.load();
  }

  track(kind: TrackKind, manifest: PlaybackManifest): ManifestTrack {
    return kind === "audio" ? manifest.audio : manifest.video;
  }

  private queueRanges(kind: TrackKind, queue: AppendQueue | null): MediaBufferedRange[] {
    if (!queue) return [];
    const buffered = queue.buffered();
    const ranges: MediaBufferedRange[] = [];
    for (let index = 0; index < buffered.length; index += 1) {
      ranges.push({
        kind,
        startMs: Math.round(buffered.start(index) * 1000),
        endMs: Math.round(buffered.end(index) * 1000),
      });
    }
    return ranges;
  }
}
