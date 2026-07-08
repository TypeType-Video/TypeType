import type { EventEmitter } from "./event-emitter";
import type { HttpClient } from "./http-client";
import type { ManifestSegment, PlaybackManifest } from "./manifest";
import type { MediaSourceController } from "./media-source-controller";
import { fetchSegmentBytes } from "./segment-fetcher";
import type { TrackKind } from "./types";

export class SegmentScheduler {
  private readonly appended = new Set<string>();

  constructor(
    private readonly http: HttpClient,
    private readonly media: MediaSourceController,
    private readonly emitter: EventEmitter,
    private readonly pollLimit: number,
  ) {}

  reset(): void {
    this.appended.clear();
  }

  async appendInit(manifest: PlaybackManifest, signal?: AbortSignal): Promise<void> {
    await Promise.all([
      this.appendUrl("audio", manifest.audio.initUrl, 0, 0, signal),
      this.appendUrl("video", manifest.video.initUrl, 0, 0, signal),
    ]);
  }

  async fill(
    manifest: PlaybackManifest,
    currentMs: number,
    goalMs: number,
    signal?: AbortSignal,
  ): Promise<void> {
    await Promise.all([
      this.fillTrack("audio", manifest.audio.segments, currentMs, goalMs, signal),
      this.fillTrack("video", manifest.video.segments, currentMs, goalMs, signal),
    ]);
  }

  private async fillTrack(
    kind: TrackKind,
    segments: ManifestSegment[],
    currentMs: number,
    goalMs: number,
    signal?: AbortSignal,
  ): Promise<void> {
    const candidates = segments.filter(
      (segment) => segment.startMs + segment.durationMs >= currentMs && segment.startMs <= goalMs,
    );
    for (const segment of candidates) {
      await this.appendUrl(kind, segment.url, segment.startMs, segment.durationMs, signal);
    }
  }

  private async appendUrl(
    kind: TrackKind,
    url: string,
    startMs: number,
    durationMs: number,
    signal?: AbortSignal,
  ): Promise<void> {
    if (signal?.aborted) throw new DOMException("Operation aborted", "AbortError");
    const key = `${kind}:${url}`;
    if (this.appended.has(key)) return;
    const bytes = await fetchSegmentBytes(this.http, url, this.pollLimit, signal);
    await this.media.append(kind, bytes);
    this.appended.add(key);
    this.emitter.emit({ type: "segment", kind, url, startMs, durationMs });
  }
}
