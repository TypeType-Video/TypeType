import type { TypeTypeMsePlayer } from "@typetype/mse";
import { isAbortError } from "./sabr-playback-retry";

export function positionMs(video: HTMLVideoElement): number {
  return Math.max(0, Math.round(video.currentTime * 1000));
}

export function secondsFromSliderPercent(duration: number, percent: number): number | null {
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(percent)) return null;
  return Math.max(0, Math.min(duration, (percent / 100) * duration));
}

export function runSabrSeek(
  player: TypeTypeMsePlayer | null,
  position: number,
  flag: { current: boolean },
  onError: () => void,
  onSeekingChange?: (seeking: boolean) => void,
) {
  if (!player || flag.current) return;
  flag.current = true;
  onSeekingChange?.(true);
  void player
    .seek(position)
    .catch((error: unknown) => {
      if (!isAbortError(error)) onError();
    })
    .finally(() => {
      flag.current = false;
      onSeekingChange?.(false);
    });
}
