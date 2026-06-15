import { useEffect, useRef } from "react";
import {
  consumePointerEvent,
  isFastForwardPointer,
  isInteractiveTarget,
} from "../components/player-hotkeys-utils";
import { useMediaPlayer } from "../lib/vidstack";
import { useHoldFastForward } from "./use-hold-fast-forward";

export function usePlayerGestures() {
  const player = useMediaPlayer();
  const { holding, isActive, start, restore } = useHoldFastForward();
  const pointerIdRef = useRef<number | null>(null);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!isFastForwardPointer(event)) return;
      if (event.defaultPrevented || isInteractiveTarget(event.target)) return;
      if (pointerIdRef.current !== null) return;
      pointerIdRef.current = event.pointerId;
      start();
    }

    function onPointerEnd(event: PointerEvent) {
      if (pointerIdRef.current !== event.pointerId) return;
      pointerIdRef.current = null;
      const wasHolding = isActive();
      restore();
      if (wasHolding) consumePointerEvent(event);
    }

    function onContextMenu(event: MouseEvent) {
      if (!isActive() || isInteractiveTarget(event.target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    const options = { capture: true };
    const el = player?.el;
    el?.addEventListener("pointerdown", onPointerDown, options);
    window.addEventListener("pointerup", onPointerEnd, options);
    window.addEventListener("pointercancel", onPointerEnd, options);
    window.addEventListener("contextmenu", onContextMenu, options);
    return () => {
      el?.removeEventListener("pointerdown", onPointerDown, options);
      window.removeEventListener("pointerup", onPointerEnd, options);
      window.removeEventListener("pointercancel", onPointerEnd, options);
      window.removeEventListener("contextmenu", onContextMenu, options);
      restore(false);
    };
  }, [player, start, restore, isActive]);

  return holding;
}
