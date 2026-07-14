import { useSyncExternalStore } from "react";
import {
  type PlaybackMode,
  readPlaybackMode,
  requestPlaybackMode,
  subscribePlaybackMode,
} from "../lib/playback-mode";

export function usePlaybackMode(): {
  playbackMode: PlaybackMode;
  setMode: (next: PlaybackMode) => void;
} {
  const playbackMode = useSyncExternalStore<PlaybackMode>(
    subscribePlaybackMode,
    readPlaybackMode,
    readPlaybackMode,
  );

  return {
    playbackMode,
    setMode: requestPlaybackMode,
  };
}
