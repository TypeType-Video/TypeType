import { useCallback, useRef } from "react";
import type { VideoStream } from "../types/stream";
import { useWatchProgressPersistence } from "./use-watch-progress-persistence";
import { useWatchSessionReporting } from "./use-watch-session-reporting";

type Args = {
  stream: VideoStream;
  isLive: boolean;
  mutate: (positionMs: number, keepalive: boolean) => void;
  onPlay?: () => void;
  onEnded: () => void;
  onTimeUpdate?: (positionMs: number) => void;
};

export function useWatchPlayerEvents({
  stream,
  isLive,
  mutate,
  onPlay,
  onEnded,
  onTimeUpdate,
}: Args) {
  const playingRef = useRef(false);
  const streamIdRef = useRef(stream.id);
  if (streamIdRef.current !== stream.id) {
    streamIdRef.current = stream.id;
  }
  const { positionRef, handleTimeUpdate, handlePause, handleSeeked } = useWatchProgressPersistence({
    durationSec: stream.duration,
    isLive,
    mutate,
  });
  const sessionReporting = useWatchSessionReporting({
    stream,
    isLive,
    onTimeUpdate: handleTimeUpdate,
    onPause: handlePause,
    onSeeked: handleSeeked,
    onEnded,
  });
  const handlePlay = useCallback(() => {
    playingRef.current = true;
    onPlay?.();
  }, [onPlay]);
  const handleTrackedPause = useCallback(() => {
    playingRef.current = false;
    sessionReporting.handlePause();
  }, [sessionReporting.handlePause]);
  return {
    positionRef,
    shouldAutoplay: () => playingRef.current,
    handleTimeUpdate: (positionMs: number) => {
      sessionReporting.handleTimeUpdate(positionMs);
      onTimeUpdate?.(positionMs);
    },
    handlePlay,
    handlePause: handleTrackedPause,
    handleSeeked: sessionReporting.handleSeeked,
    handleEnded: sessionReporting.handleEnded,
  };
}
