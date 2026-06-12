import { useEffect, useRef } from "react";
import { isIosDevice } from "../lib/ios-device";
import { getSponsorBlockEndTime, getSponsorBlockStartTime } from "../lib/sponsorblock-settings";
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
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");
  const muted = useMediaState("muted");
  const activeMuteRef = useRef<string | null>(null);
  const restoreMutedRef = useRef(false);
  useEffect(() => {
    function setMuted(value: boolean) {
      const media = player?.el?.ownerDocument.querySelector<HTMLMediaElement>("video,audio");
      if (!media) return;
      media.muted = value;
      media.dispatchEvent(new Event("volumechange", { bubbles: true }));
    }

    let activeMute: string | null = null;
    for (const seg of segments) {
      if (seg.action !== "skip") continue;
      const startTime = getSponsorBlockStartTime(seg, duration);
      const endTime = getSponsorBlockEndTime(seg, duration);
      if (currentTime >= startTime && currentTime < endTime) {
        if (!muteInsteadOfSkip) {
          remote.seek(endTime);
          break;
        }
        activeMute = `${seg.category}:${seg.startTime}`;
        if (activeMuteRef.current !== activeMute) {
          activeMuteRef.current = activeMute;
          restoreMutedRef.current = !muted;
        }
        setMuted(true);
        break;
      }
    }
    if (muteInsteadOfSkip && !activeMute && activeMuteRef.current) {
      if (restoreMutedRef.current) setMuted(false);
      activeMuteRef.current = null;
      restoreMutedRef.current = false;
    }
  }, [currentTime, duration, muted, muteInsteadOfSkip, player, segments, remote]);
  return null;
}
