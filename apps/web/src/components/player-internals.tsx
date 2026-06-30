import { useEffect, useRef } from "react";
import { isIosDevice } from "../lib/ios-device";
import { getSponsorBlockEndTime, getSponsorBlockStartTime } from "../lib/sponsorblock-settings";
import { sponsorBlockSkipTarget } from "../lib/sponsorblock-skip";
import { useMediaPlayer, useMediaRemote, useMediaState } from "../lib/vidstack";
import type { SponsorBlockSegmentItem } from "../types/api";

export function SeekBridge({
  onSeekReady,
}: {
  onSeekReady: (seek: (seconds: number) => void) => void;
}) {
  const remote = useMediaRemote();
  const onSeekReadyRef = useRef(onSeekReady);
  onSeekReadyRef.current = onSeekReady;
  useEffect(() => {
    onSeekReadyRef.current((seconds: number) => remote.seek(seconds));
  }, [remote]);
  return null;
}

export function PlayerFocuser() {
  const ios = isIosDevice();
  const player = useMediaPlayer();
  const canPlay = useMediaState("canPlay");
  const focused = useRef(false);
  useEffect(() => {
    if (ios) return;
    if (!canPlay || focused.current || !player?.el) return;
    focused.current = true;
    player.el.focus({ preventScroll: true });
  }, [ios, canPlay, player]);
  return null;
}

export function PlayerSeeker({ startTime }: { startTime: number }) {
  const remote = useMediaRemote();
  const canPlay = useMediaState("canPlay");
  const seeked = useRef(false);
  useEffect(() => {
    if (canPlay && !seeked.current && startTime > 0) {
      seeked.current = true;
      remote.seek(startTime / 1000);
    }
  }, [canPlay, startTime, remote]);
  return null;
}

export function SponsorBlockSkipper({
  segments,
  muteInsteadOfSkip,
}: {
  segments: SponsorBlockSegmentItem[];
  muteInsteadOfSkip: boolean;
}) {
  const player = useMediaPlayer();
  const remote = useMediaRemote();
  const activeMuteRef = useRef<string | null>(null);
  const restoreMutedRef = useRef(false);
  const previousTimeRef = useRef<number | null>(null);
  useEffect(() => {
    const root = player?.el;
    if (!root) return;
    const rootElement = root;
    let cleanup: (() => void) | null = null;

    function setMuted(media: HTMLMediaElement, value: boolean) {
      media.muted = value;
      media.dispatchEvent(new Event("volumechange", { bubbles: true }));
    }

    function process(media: HTMLMediaElement) {
      const duration = Number.isFinite(media.duration) ? media.duration : 0;
      const currentTime = Number.isFinite(media.currentTime) ? media.currentTime : 0;
      const previousTime = previousTimeRef.current;
      previousTimeRef.current = currentTime;
      let activeMute: string | null = null;
      for (const seg of segments) {
        if (seg.action !== "skip") continue;
        const startTime = getSponsorBlockStartTime(seg, duration);
        const endTime = getSponsorBlockEndTime(seg, duration);
        if (currentTime >= startTime && currentTime < endTime) {
          if (!muteInsteadOfSkip) {
            const crossedStart =
              previousTime === null
                ? currentTime <= startTime + 0.5
                : previousTime < startTime && previousTime <= currentTime;
            if (!crossedStart) break;
            remote.seek(sponsorBlockSkipTarget(endTime, duration));
            break;
          }
          activeMute = `${seg.category}:${seg.startTime}`;
          if (activeMuteRef.current !== activeMute) {
            activeMuteRef.current = activeMute;
            restoreMutedRef.current = !media.muted;
          }
          setMuted(media, true);
          break;
        }
      }
      if (muteInsteadOfSkip && !activeMute && activeMuteRef.current) {
        if (restoreMutedRef.current) setMuted(media, false);
        activeMuteRef.current = null;
        restoreMutedRef.current = false;
      }
    }

    function attach() {
      if (cleanup) return true;
      const media = rootElement.querySelector<HTMLMediaElement>("video,audio");
      if (!media) return false;
      previousTimeRef.current = null;
      const update = () => process(media);
      const seek = () => {
        previousTimeRef.current = Number.isFinite(media.currentTime) ? media.currentTime : 0;
        process(media);
      };
      media.addEventListener("timeupdate", update);
      media.addEventListener("seeking", seek);
      media.addEventListener("durationchange", update);
      media.addEventListener("loadedmetadata", update);
      update();
      cleanup = () => {
        media.removeEventListener("timeupdate", update);
        media.removeEventListener("seeking", seek);
        media.removeEventListener("durationchange", update);
        media.removeEventListener("loadedmetadata", update);
      };
      return true;
    }

    if (attach()) return () => cleanup?.();
    const observer = new MutationObserver(() => {
      if (attach()) observer.disconnect();
    });
    observer.observe(rootElement, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cleanup?.();
    };
  }, [muteInsteadOfSkip, player, segments, remote]);
  return null;
}
