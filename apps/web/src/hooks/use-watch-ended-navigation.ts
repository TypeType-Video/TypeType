import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WatchPlaylistItem } from "../types/playlist";
import type { VideoStream } from "../types/stream";

const AUTOPLAY_DELAY_SECONDS = 10;
const AUTOPLAY_DELAY_MS = AUTOPLAY_DELAY_SECONDS * 1000;

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
  hideRelatedVideos,
  nextParam,
  nextVideo,
  list,
  shuffle,
  related,
}: Params) {
  const navigate = useNavigate();
  const [target, setTarget] = useState<AutoplayTarget | null>(null);
  const [paused, setPaused] = useState(false);
  const [remainingMs, setRemainingMs] = useState(AUTOPLAY_DELAY_MS);
  const startedAtRef = useRef(0);
  const dismissedTargetIdRef = useRef("");

  const relatedVideo = hideRelatedVideos ? undefined : related?.[0];
  const nextVideoTitle = nextVideo?.title ?? "Next video";
  const nextVideoThumbnail = nextVideo?.thumbnail ?? "";
  const nextVideoChannelName = nextVideo?.channelName ?? "";
  const relatedVideoId = relatedVideo?.id ?? "";
  const relatedVideoTitle = relatedVideo?.title ?? "";
  const relatedVideoThumbnail = relatedVideo?.thumbnail ?? "";
  const relatedVideoChannelName = relatedVideo?.channelName ?? "";
  const relatedVideoDuration = relatedVideo?.duration;

  const nextTarget = useMemo<AutoplayTarget | null>(() => {
    if (nextParam) {
      return {
        id: nextParam,
        title: nextVideoTitle,
        thumbnail: nextVideoThumbnail,
        channelName: nextVideoChannelName,
        search: { v: nextParam, list, ...(shuffle ? { shuffle } : {}) },
      };
    }
    if (hideRelatedVideos) return null;
    if (!relatedVideoId) return null;
    return {
      id: relatedVideoId,
      title: relatedVideoTitle,
      thumbnail: relatedVideoThumbnail,
      channelName: relatedVideoChannelName,
      duration: relatedVideoDuration,
      search: { v: relatedVideoId },
    };
  }, [
    nextParam,
    nextVideoTitle,
    nextVideoThumbnail,
    nextVideoChannelName,
    list,
    shuffle,
    hideRelatedVideos,
    relatedVideoId,
    relatedVideoTitle,
    relatedVideoThumbnail,
    relatedVideoChannelName,
    relatedVideoDuration,
  ]);
  const nextTargetRef = useRef(nextTarget);
  nextTargetRef.current = nextTarget;

  const playNow = useCallback(() => {
    if (!target) return;
    navigate({ to: "/watch", search: target.search });
  }, [target, navigate]);

  const cancel = useCallback(() => {
    if (target) dismissedTargetIdRef.current = target.id;
    setTarget(null);
    setPaused(false);
    setRemainingMs(AUTOPLAY_DELAY_MS);
  }, [target]);

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
    setRemainingMs(AUTOPLAY_DELAY_MS);
    setPaused(false);
    setTarget(next);
  }, [settingsReady, autoplay]);

  return {
    handleEnded,
    autoplayState: target
      ? {
          target,
          totalSeconds: AUTOPLAY_DELAY_SECONDS,
          paused,
        }
      : null,
    playNow,
    cancel,
    togglePause,
  };
}
