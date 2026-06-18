import { useEffect } from "react";
import { useMediaPlayer } from "../lib/vidstack";

type Props = {
  onTimeUpdate?: (positionMs: number) => void;
  onPause?: () => void;
  onSeeked?: () => void;
  onEnded?: () => void;
};

function toPositionMs(media: HTMLMediaElement): number {
  return Math.max(0, Math.round(media.currentTime * 1000));
}

export function MediaProgressEvents({ onTimeUpdate, onPause, onSeeked, onEnded }: Props) {
  const player = useMediaPlayer();

  useEffect(() => {
    const root = player?.el;
    if (!root) return;
    const rootElement = root;
    let cleanup: (() => void) | null = null;

    function attach() {
      if (cleanup) return true;
      const media = rootElement.querySelector<HTMLMediaElement>("video,audio");
      if (!media) return false;

      const update = () => onTimeUpdate?.(toPositionMs(media));
      const pause = () => {
        update();
        onPause?.();
      };
      const seeked = () => {
        update();
        onSeeked?.();
      };
      const seeking = () => {
        update();
        onSeeked?.();
      };
      const ended = () => {
        update();
        onEnded?.();
      };

      media.addEventListener("timeupdate", update);
      media.addEventListener("pause", pause);
      media.addEventListener("seeking", seeking);
      media.addEventListener("seeked", seeked);
      media.addEventListener("ended", ended);
      cleanup = () => {
        media.removeEventListener("timeupdate", update);
        media.removeEventListener("pause", pause);
        media.removeEventListener("seeking", seeking);
        media.removeEventListener("seeked", seeked);
        media.removeEventListener("ended", ended);
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
  }, [onEnded, onPause, onSeeked, onTimeUpdate, player]);

  return null;
}
