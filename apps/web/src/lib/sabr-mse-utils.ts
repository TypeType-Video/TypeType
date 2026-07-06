import type { SabrFormatDescriptor, SabrMediaChunk } from "../types/sabr";
import type { SabrSourceBufferQueue } from "./sabr-source-buffer-queue";

export const BUFFER_TARGET_SEC = 12;

export type SabrTrackState = {
  format: SabrFormatDescriptor;
  queue: SabrSourceBufferQueue;
};

export type InitialSeekState = "missing" | "pending" | "settled";

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function waitForSourceOpen(source: MediaSource): Promise<void> {
  if (source.readyState === "open") return Promise.resolve();
  return new Promise((resolve, reject) => {
    source.addEventListener("sourceopen", () => resolve(), { once: true });
    source.addEventListener("error", () => reject(new Error("media_source_error")), { once: true });
  });
}

export function disposeMediaSource(media: HTMLMediaElement, objectUrl: string): void {
  media.removeAttribute("src");
  media.load();
  URL.revokeObjectURL(objectUrl);
}

export function bufferedAhead(media: HTMLMediaElement): number {
  const time = media.currentTime;
  for (let i = 0; i < media.buffered.length; i += 1) {
    const start = media.buffered.start(i);
    const end = media.buffered.end(i);
    if (time >= start - 0.25 && time <= end) return Math.max(0, end - time);
  }
  return 0;
}

export function canReconnectWaiting(
  media: HTMLMediaElement,
  video: SabrTrackState | null,
  audio: SabrTrackState | null,
  initialSeekTimeSec: number | null,
): boolean {
  if (!video?.queue.idle() || !audio?.queue.idle()) return false;
  if (initialSeekTimeSec !== null) return false;
  return bufferedAhead(media) <= 0;
}

function bufferedSeekTime(media: HTMLMediaElement, time: number): number | null {
  for (let i = 0; i < media.buffered.length; i += 1) {
    const start = media.buffered.start(i);
    if (time >= start - 0.25 && time <= media.buffered.end(i)) return Math.max(0, start);
  }
  return null;
}

function setMediaTime(media: HTMLMediaElement, time: number): boolean {
  try {
    media.currentTime = time;
    return true;
  } catch {
    return false;
  }
}

function seekToBufferedRange(media: HTMLMediaElement, time: number): InitialSeekState {
  const seekTime = bufferedSeekTime(media, time);
  if (seekTime === null) {
    setMediaTime(media, time);
    return "missing";
  }
  if (Math.abs(media.currentTime - seekTime) < 0.5 && media.readyState >= 2) return "settled";
  if (!setMediaTime(media, seekTime)) return "pending";
  return Math.abs(media.currentTime - seekTime) < 0.5 && media.readyState >= 2
    ? "settled"
    : "pending";
}

export function seekToInitialRange(
  media: HTMLMediaElement,
  timeSec: number | null,
): InitialSeekState {
  return timeSec === null ? "missing" : seekToBufferedRange(media, timeSec);
}

export function initialSeekPlayerTimeMs(timeSec: number | null): number | undefined {
  return timeSec === null ? undefined : Math.round(timeSec * 1000);
}

export function appendChunks(track: SabrTrackState, chunks: SabrMediaChunk[]): void {
  for (const chunk of chunks) {
    if (chunk.metadata.itag !== track.format.itag) continue;
    track.queue.append(chunk.bytes);
  }
}
