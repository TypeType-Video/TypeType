import type { TypeTypeMsePlayer } from "@typetype/mse";
import { isAbortError } from "./sabr-playback-retry";

type SeekFlag = { current: boolean };

type PendingSeek = {
  player: TypeTypeMsePlayer;
  position: number;
  onError: (error: unknown) => void;
  onSeekingChange?: (seeking: boolean) => void;
  timer: ReturnType<typeof setTimeout>;
};

const pendingSeeks = new WeakMap<SeekFlag, PendingSeek>();
const SEEK_RETRY_MS = 100;

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
  flag: SeekFlag,
  onError: (error: unknown) => void,
  onSeekingChange?: (seeking: boolean) => void,
) {
  if (!player) return;
  if (flag.current) {
    queueSabrSeek(player, position, flag, onError, onSeekingChange);
    return;
  }
  cancelPendingSabrSeek(flag);
  flag.current = true;
  onSeekingChange?.(true);
  void player
    .seek(position)
    .catch((error: unknown) => {
      if (!isAbortError(error)) onError(error);
    })
    .finally(() => {
      flag.current = false;
      onSeekingChange?.(false);
    });
}

function queueSabrSeek(
  player: TypeTypeMsePlayer,
  position: number,
  flag: SeekFlag,
  onError: (error: unknown) => void,
  onSeekingChange?: (seeking: boolean) => void,
): void {
  cancelPendingSabrSeek(flag);
  const retry = () => {
    const pending = pendingSeeks.get(flag);
    if (!pending) return;
    if (flag.current) {
      pending.timer = setTimeout(retry, SEEK_RETRY_MS);
      return;
    }
    pendingSeeks.delete(flag);
    runSabrSeek(pending.player, pending.position, flag, pending.onError, pending.onSeekingChange);
  };
  pendingSeeks.set(flag, {
    player,
    position,
    onError,
    onSeekingChange,
    timer: setTimeout(retry, SEEK_RETRY_MS),
  });
}

export function cancelPendingSabrSeek(flag: SeekFlag): void {
  const pending = pendingSeeks.get(flag);
  if (!pending) return;
  clearTimeout(pending.timer);
  pendingSeeks.delete(flag);
}
