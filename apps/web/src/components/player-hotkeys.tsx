import { usePlayerGestures } from "../hooks/use-player-gestures";
import { usePlayerKeyboard } from "../hooks/use-player-keyboard";
import { PlayerFastForwardIndicator } from "./player-fast-forward-indicator";

export function PlayerHotkeys({ canSeek }: { canSeek: boolean }) {
  const touchHolding = usePlayerGestures(canSeek);
  const keyboardHolding = usePlayerKeyboard(canSeek);
  return touchHolding || keyboardHolding ? <PlayerFastForwardIndicator /> : null;
}
