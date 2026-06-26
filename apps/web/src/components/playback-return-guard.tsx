import { useEffect, useRef } from "react";
import { useMediaPlayer, useMediaRemote } from "../lib/vidstack";

export function PlaybackReturnGuard() {
  const player = useMediaPlayer();
  const remote = useMediaRemote();
  const savedTimeRef = useRef(0);
  const wasPlayingRef = useRef(false);
  const restoreTokenRef = useRef(0);

  useEffect(() => {
    const root = player?.el;
    if (!root) return;
    const rootElement = root;

    function media() {
      return rootElement.querySelector<HTMLMediaElement>("video,audio");
    }

    function remember() {
      const current = media();
      if (!current) return;
      const currentTime = Number.isFinite(current.currentTime) ? current.currentTime : 0;
      const duration = Number.isFinite(current.duration) ? current.duration : 0;
      if (currentTime < 5 || (duration > 0 && currentTime >= duration * 0.95)) return;
      savedTimeRef.current = currentTime;
      wasPlayingRef.current = !current.paused && !current.ended;
      restoreTokenRef.current += 1;
    }

    function restore() {
      const token = restoreTokenRef.current;
      window.setTimeout(() => {
        if (token !== restoreTokenRef.current) return;
        const current = media();
        const savedTime = savedTimeRef.current;
        if (!current || savedTime < 5) return;
        const currentTime = Number.isFinite(current.currentTime) ? current.currentTime : 0;
        const duration = Number.isFinite(current.duration) ? current.duration : 0;
        if (duration > 0 && savedTime >= duration * 0.95) return;
        if (currentTime < savedTime - 3) remote.seek(savedTime);
        if (wasPlayingRef.current && current.paused && !current.ended) {
          void Promise.resolve(remote.play()).catch(() => {});
        }
      }, 250);
    }

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") remember();
      if (document.visibilityState === "visible") restore();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", remember);
    window.addEventListener("pageshow", restore);
    window.addEventListener("focus", restore);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", remember);
      window.removeEventListener("pageshow", restore);
      window.removeEventListener("focus", restore);
    };
  }, [player, remote]);

  return null;
}
