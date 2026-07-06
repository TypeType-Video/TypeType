import type { SabrRequestMessage } from "../types/sabr";
import type { SabrTrackState } from "./sabr-mse-utils";

export function sabrPlayerTimeMs(media: HTMLMediaElement): number {
  return Math.max(0, Math.round(media.currentTime * 1000));
}

export function sabrInitialPlayerTimeMs(media: HTMLMediaElement, startTimeMs: number): number {
  return Math.max(sabrPlayerTimeMs(media), Math.round(startTimeMs));
}

export function sabrBufferedPumpTimeMs(media: HTMLMediaElement): number {
  const current = media.currentTime;
  for (let i = 0; i < media.buffered.length; i += 1) {
    const start = media.buffered.start(i);
    const end = media.buffered.end(i);
    if (current >= start - 0.25 && current <= end) return Math.max(0, Math.round(end * 1000) + 1);
  }
  return sabrPlayerTimeMs(media);
}

function sabrPlaybackRate(media: HTMLMediaElement): number {
  const rate = media.playbackRate;
  return Number.isFinite(rate) && rate > 0 ? rate : 1;
}

export function sabrPlaybackMessage(
  type: "state" | "pump",
  requestId: string,
  media: HTMLMediaElement,
  video: SabrTrackState,
  audio: SabrTrackState,
  playerTimeMs = sabrPlayerTimeMs(media),
): SabrRequestMessage {
  return {
    type,
    requestId,
    videoItag: video.format.itag,
    audioItag: audio.format.itag,
    playerTimeMs,
    playbackRate: sabrPlaybackRate(media),
    videoActive: true,
    audioActive: true,
  };
}
