import type { PlaybackManifest } from "./manifest";

const PREROLL_RATE = 16;
const TARGET_TOLERANCE_MS = 80;

export function decodeStartMs(manifest: PlaybackManifest, targetMs: number): number {
  const segment = manifest.video.segments.find(
    (item) => item.startMs <= targetMs && item.startMs + item.durationMs > targetMs,
  );
  return segment?.startMs ?? targetMs;
}

export async function runDecodePreroll(
  video: HTMLVideoElement,
  targetMs: number,
  resumePlayback: boolean,
  signal: AbortSignal,
): Promise<void> {
  if (video.currentTime * 1000 >= targetMs - TARGET_TOLERANCE_MS) return;
  const muted = video.muted;
  const playbackRate = video.playbackRate;
  const autoplay = video.autoplay;
  video.muted = true;
  video.playbackRate = PREROLL_RATE;
  video.autoplay = true;
  try {
    await video.play();
    await waitForTarget(video, targetMs, signal);
  } finally {
    video.playbackRate = playbackRate;
    video.muted = muted;
    video.autoplay = autoplay;
    if (!resumePlayback) video.pause();
    else if (!signal.aborted) await video.play();
  }
}

function waitForTarget(
  video: HTMLVideoElement,
  targetMs: number,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutMs = Math.min(5_000, Math.max(1_000, (targetMs - video.currentTime * 1000) / 8));
    const startedAt = performance.now();
    const poll = () => {
      if (signal.aborted) return reject(new DOMException("Operation aborted", "AbortError"));
      if (video.error) return reject(new Error(video.error.message));
      if (video.currentTime * 1000 >= targetMs - TARGET_TOLERANCE_MS) return resolve();
      if (performance.now() - startedAt >= timeoutMs)
        return reject(new Error("Decode preroll timed out"));
      setTimeout(poll, 10);
    };
    poll();
  });
}
