import { type MutableRefObject, useRef } from "react";
import type { MediaSrc } from "../lib/vidstack";
import { consumeWatchAutoplayIntent } from "../lib/watch-autoplay-intent";
import { buildWatchPlayerKey } from "../lib/watch-player-key";
import { useWatchInitialAudioSource } from "./use-watch-initial-audio-source";
import { useWatchSourceStartTime } from "./use-watch-source-start-time";

type Args = {
  streamId: string;
  retryKey: number;
  startTime: number;
  manifestSrc: MediaSrc;
  positionRef: MutableRefObject<number>;
  highQuality: boolean;
  hasThumbnails: boolean;
  hasChapters: boolean;
  audioOnlyEnabled: boolean;
  audioOnlyLoading: boolean;
  hasAudioOnlySource: boolean;
  sabrEnabled: boolean;
  settingsReady: boolean;
  autoplayEnabled: boolean;
  navigating: boolean;
  shouldAutoplay: () => boolean;
};

function sourceIdentity(src: MediaSrc): string {
  if (typeof src === "string") return src;
  if (Array.isArray(src)) return String(src.length);
  if (src && typeof src === "object" && "src" in src && typeof src.src === "string") return src.src;
  return "unknown";
}

type AutoplayState = {
  playerKey: string;
  settingsReady: boolean;
  autoplay: boolean;
};

export function useWatchPlayerSourceState(args: Args) {
  const sourceStart = useWatchSourceStartTime({
    streamId: args.streamId,
    sourceKey: args.audioOnlyEnabled ? "audio" : "video",
    retryKey: args.retryKey,
    startTime: args.startTime,
    positionRef: args.positionRef,
  });
  const playerKey = buildWatchPlayerKey({
    streamId: args.streamId,
    retryKey: args.retryKey,
    sourceKey: `${args.sabrEnabled ? "sabr" : sourceStart.keyPart}:${sourceIdentity(args.manifestSrc)}`,
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
    const autoplayIntent = consumeWatchAutoplayIntent();
    autoplayRef.current = {
      playerKey,
      settingsReady: args.settingsReady,
      autoplay:
        args.retryKey === 0 &&
        args.settingsReady &&
        (args.autoplayEnabled || args.shouldAutoplay() || autoplayIntent),
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
