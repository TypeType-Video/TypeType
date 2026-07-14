import { usePlayerGestures } from "../hooks/use-player-gestures";
import { usePlayerKeyboard } from "../hooks/use-player-keyboard";
import { PlayerFastForwardIndicator } from "./player-fast-forward-indicator";

export function PlayerHotkeys({
  canSeek,
  sabrVideo,
}: {
  canSeek: boolean;
  sabrVideo: HTMLVideoElement | null;
}) {
  const touchHolding = usePlayerGestures(canSeek);
  const keyboardHolding = usePlayerKeyboard(canSeek, sabrVideo);
  return touchHolding || keyboardHolding ? <PlayerFastForwardIndicator /> : null;
}
