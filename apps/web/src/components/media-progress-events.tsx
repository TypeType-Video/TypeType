import { useEffect, useRef } from "react";
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
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPauseRef = useRef(onPause);
  const onSeekedRef = useRef(onSeeked);
  const onEndedRef = useRef(onEnded);

  onTimeUpdateRef.current = onTimeUpdate;
  onPauseRef.current = onPause;
  onSeekedRef.current = onSeeked;
  onEndedRef.current = onEnded;

  useEffect(() => {
    const root = player?.el;
    if (!root) return;
    const rootElement = root;
    let cleanup: (() => void) | null = null;

    function attach() {
      if (cleanup) return true;
      const media = rootElement.querySelector<HTMLMediaElement>("video,audio");
      if (!media) return false;

      const update = () => onTimeUpdateRef.current?.(toPositionMs(media));
      const pause = () => {
        update();
        onPauseRef.current?.();
      };
      const seeked = () => {
        update();
        onSeekedRef.current?.();
      };
      const seeking = () => {
        update();
      };
      const ended = () => {
        update();
        onEndedRef.current?.();
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
  }, [player]);

  return null;
}
