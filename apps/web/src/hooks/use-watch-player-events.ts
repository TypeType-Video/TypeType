import type { VideoStream } from "../types/stream";
import { useWatchProgressPersistence } from "./use-watch-progress-persistence";
import { useWatchSessionReporting } from "./use-watch-session-reporting";

type Args = {
  stream: VideoStream;
  isLive: boolean;
  mutate: (positionMs: number) => void;
  onEnded: () => void;
};

export function useWatchPlayerEvents({ stream, isLive, mutate, onEnded }: Args) {
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
  return {
    positionRef,
    handleTimeUpdate: sessionReporting.handleTimeUpdate,
    handlePause: sessionReporting.handlePause,
    handleSeeked: sessionReporting.handleSeeked,
    handleEnded: sessionReporting.handleEnded,
  };
}
