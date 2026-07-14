import { useEffect, useRef } from "react";
import { recordClientEvent } from "../lib/client-debug-log";
import { useMediaPlayer, useMediaRemote, useMediaState } from "../lib/vidstack";

function seekable(media: HTMLMediaElement, target: number) {
  if (media.readyState === 0 && !Number.isFinite(media.duration)) return false;
  if (media.seekable.length === 0) return true;
  for (let index = 0; index < media.seekable.length; index += 1) {
    if (target >= media.seekable.start(index) && target <= media.seekable.end(index)) return true;
  }
  return false;
}

export function PlayerSeeker({ startTime }: { startTime: number }) {
  const player = useMediaPlayer();
  const remote = useMediaRemote();
  const canPlay = useMediaState("canPlay");
  const seeked = useRef(false);
  const startTimeRef = useRef(startTime);
  if (startTimeRef.current !== startTime) {
    startTimeRef.current = startTime;
    seeked.current = false;
  }

  useEffect(() => {
    if (startTime <= 0 || seeked.current) return;
    const target = startTime / 1000;
    const root = player?.el;
    let timeout = 0;
    let applying = false;

    function seekMedia(media: HTMLMediaElement) {
      if (seeked.current || applying) return;
      if (!seekable(media, target)) {
        recordClientEvent("player.seek_wait", {
          targetMs: Math.round(target * 1000),
          readyState: media.readyState,
          seekableRanges: media.seekable.length,
        });
        return;
      }
      applying = true;
      try {
        media.currentTime = target;
      } catch {}
      remote.seek(target);
      recordClientEvent("player.seek_apply", {
        targetMs: Math.round(target * 1000),
        currentMs: Math.round(media.currentTime * 1000),
        tag: media.tagName,
      });
      timeout = window.setTimeout(() => {
        applying = false;
        if (Math.abs(media.currentTime - target) <= 1.5 || media.currentTime > target) {
          recordClientEvent("player.seek_settled", {
            targetMs: Math.round(target * 1000),
            currentMs: Math.round(media.currentTime * 1000),
            tag: media.tagName,
          });
          seeked.current = true;
          return;
        }
        seekMedia(media);
      }, 250);
    }

    if (canPlay) remote.seek(target);
    if (!root) return;
    const rootElement = root;
    let cleanup: (() => void) | null = null;

    function attach() {
      if (cleanup) return true;
      const media = rootElement.querySelector<HTMLMediaElement>("video,audio");
      if (!media) return false;
      const seek = () => seekMedia(media);
      media.addEventListener("loadedmetadata", seek);
      media.addEventListener("durationchange", seek);
      media.addEventListener("canplay", seek);
      media.addEventListener("progress", seek);
      seek();
      cleanup = () => {
        window.clearTimeout(timeout);
        media.removeEventListener("loadedmetadata", seek);
        media.removeEventListener("durationchange", seek);
        media.removeEventListener("canplay", seek);
        media.removeEventListener("progress", seek);
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
  }, [canPlay, player, remote, startTime]);
  return null;
}
