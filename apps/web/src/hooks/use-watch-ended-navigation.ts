import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { markWatchAutoplayIntent } from "../lib/watch-autoplay-intent";
import type { WatchPlaylistItem } from "../types/playlist";
import type { VideoStream } from "../types/stream";

const DEFAULT_AUTOPLAY_DELAY_SECONDS = 10;

type WatchSearch = {
  v: string;
  list?: string;
  shuffle?: string;
};

export type AutoplayTarget = {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  source: "playlist" | "related";
  duration?: number;
  search: WatchSearch;
};

export type AutoplayState = {
  target: AutoplayTarget;
  totalSeconds: number;
  paused: boolean;
};

type Params = {
  settingsReady: boolean;
  autoplay: boolean;
  countdownSeconds: number;
  skipPlaylistAutoplayScreen: boolean;
  hideRelatedVideos: boolean;
  nextParam: string | null;
  nextVideo?: WatchPlaylistItem | null;
  list?: string;
  shuffle?: string;
  related?: VideoStream[];
};

export function useWatchEndedNavigation({
  settingsReady,
  autoplay,
  countdownSeconds,
  skipPlaylistAutoplayScreen,
  hideRelatedVideos,
  nextParam,
  nextVideo,
  list,
  shuffle,
  related,
}: Params) {
  const navigate = useNavigate();
  const delaySeconds = Math.min(60, Math.max(0, Math.round(countdownSeconds)));
  const delayMs = delaySeconds * 1000;
  const [target, setTarget] = useState<AutoplayTarget | null>(null);
  const [paused, setPaused] = useState(false);
  const [remainingMs, setRemainingMs] = useState(DEFAULT_AUTOPLAY_DELAY_SECONDS * 1000);
  const startedAtRef = useRef(0);
  const dismissedTargetIdRef = useRef("");

  const nextTarget = useMemo<AutoplayTarget | null>(() => {
    if (nextParam) {
      return {
        id: nextParam,
        title: nextVideo?.title ?? "Next video",
        thumbnail: nextVideo?.thumbnail ?? "",
        channelName: nextVideo?.channelName ?? "",
        source: "playlist",
        search: { v: nextParam, list, ...(shuffle ? { shuffle } : {}) },
      };
    }
    if (hideRelatedVideos) return null;
    const relatedVideo = related?.[0];
    if (!relatedVideo) return null;
    return {
      id: relatedVideo.id,
      title: relatedVideo.title,
      thumbnail: relatedVideo.thumbnail,
      channelName: relatedVideo.channelName,
      source: "related",
      duration: relatedVideo.duration,
      search: { v: relatedVideo.id },
    };
  }, [nextParam, nextVideo, list, shuffle, hideRelatedVideos, related]);
  const nextTargetRef = useRef(nextTarget);
  nextTargetRef.current = nextTarget;

  const navigateToTarget = useCallback(
    (next: AutoplayTarget) => {
      markWatchAutoplayIntent();
      navigate({ to: "/watch", search: next.search });
    },
    [navigate],
  );

  const playNow = useCallback(() => {
    if (!target) return;
    navigateToTarget(target);
  }, [target, navigateToTarget]);

  const cancel = useCallback(() => {
    if (target) dismissedTargetIdRef.current = target.id;
    setTarget(null);
    setPaused(false);
    setRemainingMs(delayMs);
  }, [target, delayMs]);

  const togglePause = useCallback(() => {
    if (!target) return;
    if (paused) {
      setPaused(false);
      return;
    }
    const elapsedMs = Date.now() - startedAtRef.current;
    setRemainingMs((current) => Math.max(0, current - elapsedMs));
    setPaused(true);
  }, [target, paused]);

  useEffect(() => {
    if (nextTarget?.id !== dismissedTargetIdRef.current) dismissedTargetIdRef.current = "";
    setTarget((current) => {
      if (!current) return null;
      if (!nextTarget || current.id !== nextTarget.id) return null;
      return nextTarget;
    });
  }, [nextTarget]);

  useEffect(() => {
    if (!target || paused) return;
    if (remainingMs <= 0) {
      playNow();
      return;
    }
    startedAtRef.current = Date.now();
    const timer = window.setTimeout(playNow, remainingMs);
    return () => window.clearTimeout(timer);
  }, [target, paused, remainingMs, playNow]);

  const handleEnded = useCallback(() => {
    if (!settingsReady || !autoplay) return;
    const next = nextTargetRef.current;
    if (!next || dismissedTargetIdRef.current === next.id) return;
    if (skipPlaylistAutoplayScreen && next.source === "playlist") {
      navigateToTarget(next);
      return;
    }
    if (delayMs <= 0) {
      navigateToTarget(next);
      return;
    }
    setRemainingMs(delayMs);
    setPaused(false);
    setTarget(next);
  }, [settingsReady, autoplay, skipPlaylistAutoplayScreen, delayMs, navigateToTarget]);

  return {
    nextTarget,
    handleEnded,
    autoplayState: target
      ? {
          target,
          totalSeconds: delaySeconds,
          paused,
        }
      : null,
    playNow,
    cancel,
    togglePause,
  };
}
