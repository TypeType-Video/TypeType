import { useEffect, useRef } from "react";
import {
  computeScrubTarget,
  consumePointerEvent,
  exceededDragThreshold,
  isFastForwardPointer,
  isInteractiveTarget,
} from "../components/player-hotkeys-utils";
import { useMediaPlayer, useMediaRemote, useMediaState } from "../lib/vidstack";
import { useHoldFastForward } from "./use-hold-fast-forward";

const SEEK_THROTTLE_MS = 80;
const SCRUB_RANGE_SECONDS = 90;

export function usePlayerGestures(canSeek: boolean) {
  const player = useMediaPlayer();
  const remote = useMediaRemote();
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");
  const { holding, isActive, start, restore } = useHoldFastForward();
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const scrubbingRef = useRef(false);
  const targetRef = useRef(0);
  const lastSeekRef = useRef(0);
  const suppressTapRef = useRef(false);

  currentTimeRef.current = Number.isFinite(currentTime) ? currentTime : 0;
  durationRef.current = Number.isFinite(duration) ? duration : 0;

  useEffect(() => {
    function endScrub(commit: boolean) {
      if (!scrubbingRef.current) return;
      scrubbingRef.current = false;
      if (commit) remote.seek(targetRef.current);
    }

    function onPointerDown(event: PointerEvent) {
      if (!isFastForwardPointer(event)) return;
      if (event.defaultPrevented || isInteractiveTarget(event.target)) return;
      if (pointerIdRef.current !== null) return;
      pointerIdRef.current = event.pointerId;
      startXRef.current = event.clientX;
      startYRef.current = event.clientY;
      startTimeRef.current = currentTimeRef.current;
      suppressTapRef.current = false;
      start();
    }

    function onPointerMove(event: PointerEvent) {
      if (pointerIdRef.current !== event.pointerId || !canSeek) return;
      if (event.pointerType === "mouse") return;
      const dx = event.clientX - startXRef.current;
      if (!scrubbingRef.current) {
        if (!exceededDragThreshold(dx, event.clientY - startYRef.current)) return;
        scrubbingRef.current = true;
        suppressTapRef.current = true;
        lastSeekRef.current = 0;
        restore();
      }
      targetRef.current = computeScrubTarget(
        startTimeRef.current,
        dx,
        player?.el?.clientWidth ?? 0,
        SCRUB_RANGE_SECONDS,
        durationRef.current,
      );
      const now = performance.now();
      if (now - lastSeekRef.current < SEEK_THROTTLE_MS) return;
      lastSeekRef.current = now;
      remote.seek(targetRef.current);
    }

    function onPointerEnd(event: PointerEvent) {
      if (pointerIdRef.current !== event.pointerId) return;
      pointerIdRef.current = null;
      const wasScrubbing = scrubbingRef.current;
      const wasHolding = isActive();
      endScrub(event.type !== "pointercancel");
      restore();
      if (wasScrubbing || wasHolding) {
        suppressTapRef.current = true;
        if (event.pointerType === "mouse") consumePointerEvent(event);
      }
    }

    function onTouchEnd(event: TouchEvent) {
      if (suppressTapRef.current || scrubbingRef.current || isActive()) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    }

    function onContextMenu(event: MouseEvent) {
      if (!isActive() || isInteractiveTarget(event.target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    const options = { capture: true };
    const touchOptions = { capture: true, passive: false };
    const el = player?.el;
    el?.addEventListener("pointerdown", onPointerDown, options);
    window.addEventListener("pointermove", onPointerMove, options);
    window.addEventListener("pointerup", onPointerEnd, options);
    window.addEventListener("pointercancel", onPointerEnd, options);
    el?.addEventListener("touchend", onTouchEnd, touchOptions);
    window.addEventListener("contextmenu", onContextMenu, options);
    return () => {
      el?.removeEventListener("pointerdown", onPointerDown, options);
      window.removeEventListener("pointermove", onPointerMove, options);
      window.removeEventListener("pointerup", onPointerEnd, options);
      window.removeEventListener("pointercancel", onPointerEnd, options);
      el?.removeEventListener("touchend", onTouchEnd, touchOptions);
      window.removeEventListener("contextmenu", onContextMenu, options);
      endScrub(false);
      restore(false);
    };
  }, [canSeek, player, remote, start, restore, isActive]);

  return holding;
}
