import { useCallback, useEffect, useRef } from "react";
import {
  reportPlaybackProgress,
  reportPlaybackStart,
  reportPlaybackStop,
  type SessionPlaybackPayload,
  type SessionPlaybackStartPayload,
} from "../lib/api-admin-sessions";
import { getSessionDevicePayload } from "../lib/session-device";
import type { VideoStream } from "../types/stream";
import { useAuth } from "./use-auth";

const PROGRESS_INTERVAL_MS = 15_000;

type Args = {
  stream: VideoStream;
  isLive: boolean;
  onTimeUpdate: (positionMs: number) => void;
  onPause: () => void;
  onSeeked: () => void;
  onEnded: () => void;
};

function durationMs(durationSec: number): number | null {
  if (!Number.isFinite(durationSec) || durationSec <= 0) return null;
  return Math.round(durationSec * 1000);
}

export function useWatchSessionReporting({
  stream,
  isLive,
  onTimeUpdate,
  onPause,
  onSeeked,
  onEnded,
}: Args) {
  const { status } = useAuth();
  const enabled = status === "authenticated" && !isLive;
  const startedRef = useRef(false);
  const lastReportRef = useRef(0);
  const positionRef = useRef(0);

  const buildPayload = useCallback(
    (positionMs: number, paused: boolean): SessionPlaybackStartPayload => ({
      ...getSessionDevicePayload(),
      videoUrl: stream.id,
      title: stream.title,
      thumbnail: stream.thumbnail,
      channelName: stream.channelName,
      positionMs: Math.max(0, Math.round(positionMs)),
      durationMs: durationMs(stream.duration),
      paused,
    }),
    [stream.channelName, stream.duration, stream.id, stream.thumbnail, stream.title],
  );

  const start = useCallback(
    (positionMs: number) => {
      if (!enabled || startedRef.current) return;
      startedRef.current = true;
      lastReportRef.current = Date.now();
      void reportPlaybackStart(buildPayload(positionMs, false)).catch(() => {});
    },
    [buildPayload, enabled],
  );

  const progress = useCallback(
    (positionMs: number, paused: boolean, force: boolean) => {
      if (!enabled) return;
      if (!startedRef.current) start(positionMs);
      const now = Date.now();
      if (!force && now - lastReportRef.current < PROGRESS_INTERVAL_MS) return;
      lastReportRef.current = now;
      const payload: SessionPlaybackPayload = buildPayload(positionMs, paused);
      void reportPlaybackProgress(payload).catch(() => {});
    },
    [buildPayload, enabled, start],
  );

  const handleTimeUpdate = useCallback(
    (positionMs: number) => {
      positionRef.current = positionMs;
      onTimeUpdate(positionMs);
      progress(positionMs, false, false);
    },
    [onTimeUpdate, progress],
  );

  const handlePause = useCallback(() => {
    onPause();
    progress(positionRef.current, true, true);
  }, [onPause, progress]);

  const handleSeeked = useCallback(() => {
    onSeeked();
    progress(positionRef.current, false, true);
  }, [onSeeked, progress]);

  const handleEnded = useCallback(() => {
    if (enabled && startedRef.current) {
      startedRef.current = false;
      void reportPlaybackStop(getSessionDevicePayload()).catch(() => {});
    }
    onEnded();
  }, [enabled, onEnded]);

  useEffect(() => {
    const videoUrl = stream.id;
    startedRef.current = false;
    lastReportRef.current = 0;
    positionRef.current = 0;
    if (!enabled) return;
    const stop = () => {
      if (!startedRef.current || !videoUrl) return;
      startedRef.current = false;
      void reportPlaybackStop(getSessionDevicePayload()).catch(() => {});
    };
    window.addEventListener("pagehide", stop);
    return () => {
      window.removeEventListener("pagehide", stop);
      stop();
    };
  }, [enabled, stream.id]);

  return { handleTimeUpdate, handlePause, handleSeeked, handleEnded };
}
