import { useCallback, useEffect, useRef } from "react";
import { recordClientEvent } from "../lib/client-debug-log";

type MutateFn = (positionMs: number) => void;
type SaveReason = "interval" | "pagehide" | "pause" | "seeked" | "threshold" | "visibility";

type Args = {
  durationSec: number;
  isLive: boolean;
  mutate: MutateFn;
};

export function useWatchProgressPersistence({ durationSec, isLive, mutate }: Args) {
  const positionRef = useRef(0);
  const lastSavedPositionRef = useRef(0);
  const lastSeekedSaveRef = useRef(0);
  const maxPositionSeenRef = useRef(0);
  const mutateRef = useRef(mutate);
  mutateRef.current = mutate;

  const saveRef = useRef<(reason: SaveReason) => void>(() => {});
  saveRef.current = (reason: SaveReason) => {
    const positionMs = Math.max(0, Math.round(positionRef.current));
    const durationMs = durationSec * 1000;
    if (!Number.isFinite(positionMs)) return;
    if (reason === "seeked" && positionMs < 5000 && maxPositionSeenRef.current >= 5000) {
      lastSavedPositionRef.current = 0;
      recordClientEvent("progress.save", { positionMs: 0, reason });
      mutateRef.current(0);
      return;
    }
    if (positionMs <= 0) return;
    if (positionMs >= durationMs * 0.95) return;
    if (positionMs < 5000) return;
    if (reason !== "seeked" && positionMs < lastSavedPositionRef.current) return;
    lastSavedPositionRef.current = positionMs;
    recordClientEvent("progress.save", { positionMs, reason });
    mutateRef.current(positionMs);
  };

  const handleTimeUpdate = useCallback(
    (positionMs: number) => {
      positionRef.current = positionMs;
      maxPositionSeenRef.current = Math.max(maxPositionSeenRef.current, positionMs);
      if (!isLive && positionMs >= 5000 && lastSavedPositionRef.current < 5000) {
        saveRef.current("threshold");
      }
    },
    [isLive],
  );

  const handlePause = useCallback(() => {
    saveRef.current("pause");
  }, []);

  const handleSeeked = useCallback(() => {
    const positionMs = Math.max(0, Math.round(positionRef.current));
    if (positionMs === lastSeekedSaveRef.current) return;
    lastSeekedSaveRef.current = positionMs;
    saveRef.current("seeked");
  }, []);

  useEffect(() => {
    if (isLive) return;
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") saveRef.current("visibility");
    };
    const onPageHide = () => {
      saveRef.current("pagehide");
    };
    const interval = setInterval(() => saveRef.current("interval"), 10_000);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [isLive]);

  return {
    positionRef,
    handleTimeUpdate,
    handlePause,
    handleSeeked,
  };
}
