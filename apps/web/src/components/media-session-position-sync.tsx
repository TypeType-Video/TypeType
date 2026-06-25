import { useEffect } from "react";
import { useMediaPlayer } from "../lib/vidstack";

type Props = {
  currentTimeRef: { current: number };
  durationRef: { current: number };
};

export function MediaSessionPositionSync({ currentTimeRef, durationRef }: Props) {
  const player = useMediaPlayer();

  useEffect(() => {
    const rootElement = player?.el;
    if (rootElement == null) return;
    const mediaRoot = rootElement;
    let cleanup: (() => void) | null = null;

    function syncPosition(media: HTMLMediaElement) {
      const duration = Number.isFinite(media.duration) ? media.duration : 0;
      const currentTime = Number.isFinite(media.currentTime) ? media.currentTime : 0;
      const playbackRate =
        Number.isFinite(media.playbackRate) && media.playbackRate > 0 ? media.playbackRate : 1;
      currentTimeRef.current = currentTime;
      durationRef.current = duration;
      if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
      const setPositionState = navigator.mediaSession.setPositionState?.bind(
        navigator.mediaSession,
      );
      if (!setPositionState || duration <= 0 || currentTime < 0) return;
      try {
        setPositionState({ duration, playbackRate, position: Math.min(duration, currentTime) });
      } catch {}
    }

    function attach() {
      if (cleanup) return true;
      const media = mediaRoot.querySelector<HTMLMediaElement>("video,audio");
      if (!media) return false;
      const sync = () => syncPosition(media);
      media.addEventListener("timeupdate", sync);
      media.addEventListener("durationchange", sync);
      media.addEventListener("ratechange", sync);
      media.addEventListener("loadedmetadata", sync);
      sync();
      cleanup = () => {
        media.removeEventListener("timeupdate", sync);
        media.removeEventListener("durationchange", sync);
        media.removeEventListener("ratechange", sync);
        media.removeEventListener("loadedmetadata", sync);
      };
      return true;
    }

    if (attach()) return () => cleanup?.();
    const observer = new MutationObserver(() => {
      if (attach()) observer.disconnect();
    });
    observer.observe(mediaRoot, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cleanup?.();
    };
  }, [currentTimeRef, durationRef, player]);

  return null;
}
