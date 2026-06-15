import { useEffect, useRef } from "react";
import { clampTime, consumeEvent, isInteractiveTarget } from "../components/player-hotkeys-utils";
import { useMediaRemote, useMediaState } from "../lib/vidstack";
import { useHoldFastForward } from "./use-hold-fast-forward";

const FRAME_STEP_SECONDS = 1 / 30;

export function usePlayerKeyboard(canSeek: boolean) {
  const remote = useMediaRemote();
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");
  const paused = useMediaState("paused");
  const { holding, isActive, start, restore } = useHoldFastForward();
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const pausedRef = useRef(true);
  const spaceStartedRef = useRef(false);

  currentTimeRef.current = Number.isFinite(currentTime) ? currentTime : 0;
  durationRef.current = Number.isFinite(duration) ? duration : 0;
  pausedRef.current = paused;

  useEffect(() => {
    function togglePaused() {
      if (pausedRef.current) void Promise.resolve(remote.play()).catch(() => {});
      else void Promise.resolve(remote.pause()).catch(() => {});
    }

    function stepFrame(direction: -1 | 1) {
      if (!canSeek || !pausedRef.current) return;
      remote.seek(
        clampTime(currentTimeRef.current + FRAME_STEP_SECONDS * direction, durationRef.current),
      );
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      if (isInteractiveTarget(event.target)) return;
      if (event.code === "Space") {
        consumeEvent(event);
        if (!event.repeat) {
          spaceStartedRef.current = true;
          start();
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
      if (event.code !== "Space" || !spaceStartedRef.current) return;
      spaceStartedRef.current = false;
      consumeEvent(event);
      const wasHolding = isActive();
      restore();
      if (!wasHolding) togglePaused();
    }

    function onBlur() {
      spaceStartedRef.current = false;
      restore();
    }

    const options = { capture: true };
    window.addEventListener("keydown", onKeyDown, options);
    window.addEventListener("keyup", onKeyUp, options);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown, options);
      window.removeEventListener("keyup", onKeyUp, options);
      window.removeEventListener("blur", onBlur);
      restore(false);
    };
  }, [canSeek, remote, start, restore, isActive]);

  return holding;
}
