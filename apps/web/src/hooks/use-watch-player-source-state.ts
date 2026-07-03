import { type MutableRefObject, useRef } from "react";
import { buildWatchPlayerKey } from "../lib/watch-player-key";
import { useWatchInitialAudioSource } from "./use-watch-initial-audio-source";
import { useWatchSourceStartTime } from "./use-watch-source-start-time";

type Args = {
  streamId: string;
  retryKey: number;
  startTime: number;
  positionRef: MutableRefObject<number>;
  highQuality: boolean;
  hasThumbnails: boolean;
  hasChapters: boolean;
  audioOnlyEnabled: boolean;
  audioOnlyLoading: boolean;
  hasAudioOnlySource: boolean;
  settingsReady: boolean;
  navigating: boolean;
  shouldAutoplay: () => boolean;
};

type AutoplayState = {
  playerKey: string;
  settingsReady: boolean;
  autoplay: boolean;
};

export function useWatchPlayerSourceState(args: Args) {
  const sourceStart = useWatchSourceStartTime({
    streamId: args.streamId,
    sourceKey: args.hasAudioOnlySource ? "audio" : "video",
    retryKey: args.retryKey,
    startTime: args.startTime,
    positionRef: args.positionRef,
  });
  const playerKey = buildWatchPlayerKey({
    streamId: args.streamId,
    retryKey: args.retryKey,
    sourceKey: sourceStart.keyPart,
    highQuality: args.highQuality,
    hasThumbnails: args.hasThumbnails,
    hasChapters: args.hasChapters,
  });
  const autoplayRef = useRef<AutoplayState | null>(null);
  const autoplayState = autoplayRef.current;
  if (
    !autoplayState ||
    autoplayState.playerKey !== playerKey ||
    (!autoplayState.settingsReady && args.settingsReady)
  ) {
    autoplayRef.current = {
      playerKey,
      settingsReady: args.settingsReady,
      autoplay: args.retryKey === 0 && args.settingsReady && args.shouldAutoplay(),
    };
  }
  const waitForInitialAudioSource = useWatchInitialAudioSource(args);
  return {
    playerKey,
    startTime: sourceStart.startTime,
    waitForInitialAudioSource,
    autoplay: autoplayRef.current?.autoplay ?? false,
  };
}
