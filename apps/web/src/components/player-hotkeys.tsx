import { useEffect, useRef, useState } from "react";
import { useMediaPlayer, useMediaRemote, useMediaState } from "../lib/vidstack";
import { PlayerFastForwardIndicator } from "./player-fast-forward-indicator";
import {
  clampTime,
  consumeEvent,
  consumePointerEvent,
  isInteractiveTarget,
  isMobilePointer,
} from "./player-hotkeys-utils";

const HOLD_SPEED = 2;
const HOLD_DELAY_MS = 180;
const FRAME_STEP_SECONDS = 1 / 30;

export function PlayerHotkeys({ canSeek }: { canSeek: boolean }) {
  const player = useMediaPlayer();
  const remote = useMediaRemote();
  const paused = useMediaState("paused");
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");
  const playbackRate = useMediaState("playbackRate");
  const [holdingFastForward, setHoldingFastForward] = useState(false);
  const pausedRef = useRef(true);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const playbackRateRef = useRef(1);
  const holdTimerRef = useRef<number | null>(null);
  const holdActiveRef = useRef(false);
  const spaceStartedRef = useRef(false);
  const touchPointerIdRef = useRef<number | null>(null);
  const holdStartedPausedRef = useRef(false);
  const restoreRateRef = useRef(1);

  pausedRef.current = paused;
  currentTimeRef.current = Number.isFinite(currentTime) ? currentTime : 0;
  durationRef.current = Number.isFinite(duration) ? duration : 0;
  playbackRateRef.current = Number.isFinite(playbackRate) && playbackRate > 0 ? playbackRate : 1;

  useEffect(() => {
    function clearHoldTimer() {
      if (holdTimerRef.current === null) return;
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    function restoreRate({ updateIndicator = true } = {}) {
      clearHoldTimer();
      if (!holdActiveRef.current) return;
      holdActiveRef.current = false;
      if (updateIndicator) setHoldingFastForward(false);
      remote.changePlaybackRate(restoreRateRef.current);
      if (holdStartedPausedRef.current) {
        void Promise.resolve(remote.pause()).catch(() => {});
      }
      holdStartedPausedRef.current = false;
    }

    function startHold() {
      if (holdTimerRef.current !== null || holdActiveRef.current) return;
      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = null;
        holdActiveRef.current = true;
        setHoldingFastForward(true);
        holdStartedPausedRef.current = pausedRef.current;
        restoreRateRef.current = playbackRateRef.current;
        remote.changePlaybackRate(HOLD_SPEED);
        if (pausedRef.current) {
          void Promise.resolve(remote.play()).catch(() => {});
        }
      }, HOLD_DELAY_MS);
    }

    function togglePaused() {
      if (pausedRef.current) {
        void Promise.resolve(remote.play()).catch(() => {});
      } else {
        void Promise.resolve(remote.pause()).catch(() => {});
      }
    }

    function stepFrame(direction: -1 | 1) {
      if (!canSeek || !pausedRef.current) return;
      const next = clampTime(
        currentTimeRef.current + FRAME_STEP_SECONDS * direction,
        durationRef.current,
      );
      remote.seek(next);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (isInteractiveTarget(event.target)) return;
      if (event.code === "Space") {
        consumeEvent(event);
        if (!event.repeat) {
          spaceStartedRef.current = true;
          startHold();
        }
        return;
      }
      if (event.key === "," || event.code === "Comma") {
        consumeEvent(event);
        stepFrame(-1);
        return;
      }
      if (event.key === "." || event.code === "Period") {
        consumeEvent(event);
        stepFrame(1);
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.code !== "Space") return;
      if (!spaceStartedRef.current) return;
      spaceStartedRef.current = false;
      consumeEvent(event);
      const wasHolding = holdActiveRef.current;
      restoreRate();
      if (!wasHolding) togglePaused();
    }

    function onBlur() {
      spaceStartedRef.current = false;
      touchPointerIdRef.current = null;
      restoreRate();
    }

    function onPointerDown(event: PointerEvent) {
      if (!isMobilePointer(event)) return;
      if (event.defaultPrevented || isInteractiveTarget(event.target)) return;
      if (touchPointerIdRef.current !== null) return;
      touchPointerIdRef.current = event.pointerId;
      startHold();
    }

    function onPointerEnd(event: PointerEvent) {
      if (touchPointerIdRef.current !== event.pointerId) return;
      touchPointerIdRef.current = null;
      const wasHolding = holdActiveRef.current;
      restoreRate();
      if (wasHolding) consumePointerEvent(event);
    }

    function onContextMenu(event: MouseEvent) {
      if (!holdActiveRef.current || isInteractiveTarget(event.target)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    const options = { capture: true };
    const playerElement = player?.el;
    window.addEventListener("keydown", onKeyDown, options);
    window.addEventListener("keyup", onKeyUp, options);
    window.addEventListener("blur", onBlur);
    playerElement?.addEventListener("pointerdown", onPointerDown, options);
    window.addEventListener("pointerup", onPointerEnd, options);
    window.addEventListener("pointercancel", onPointerEnd, options);
    window.addEventListener("contextmenu", onContextMenu, options);
    return () => {
      window.removeEventListener("keydown", onKeyDown, options);
      window.removeEventListener("keyup", onKeyUp, options);
      window.removeEventListener("blur", onBlur);
      playerElement?.removeEventListener("pointerdown", onPointerDown, options);
      window.removeEventListener("pointerup", onPointerEnd, options);
      window.removeEventListener("pointercancel", onPointerEnd, options);
      window.removeEventListener("contextmenu", onContextMenu, options);
      restoreRate({ updateIndicator: false });
      clearHoldTimer();
    };
  }, [canSeek, player, remote]);

  if (!holdingFastForward) return null;

  return <PlayerFastForwardIndicator />;
}
