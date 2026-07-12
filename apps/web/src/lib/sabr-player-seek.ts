import type { TypeTypeMsePlayer } from "@typetype/mse";
import { isAbortError } from "./sabr-playback-retry";

export function positionMs(video: HTMLVideoElement): number {
  return Math.max(0, Math.round(video.currentTime * 1000));
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
