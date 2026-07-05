import { useEffect, useRef } from "react";
import { useMediaPlayer } from "../lib/vidstack";

type Props = {
  onTimeUpdate?: (positionMs: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onSeeked?: () => void;
  onEnded?: () => void;
  onPositionReaderChange?: (reader: (() => number | null) | null) => void;
};

function toPositionMs(media: HTMLMediaElement): number {
  return Math.max(0, Math.round(media.currentTime * 1000));
}

export function MediaProgressEvents({
  onTimeUpdate,
  onPlay,
  onPause,
  onSeeked,
  onEnded,
  onPositionReaderChange,
}: Props) {
  const player = useMediaPlayer();
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const onPlayRef = useRef(onPlay);
  const onPauseRef = useRef(onPause);
  const onSeekedRef = useRef(onSeeked);
  const onEndedRef = useRef(onEnded);
  const onPositionReaderChangeRef = useRef(onPositionReaderChange);

  onTimeUpdateRef.current = onTimeUpdate;
  onPlayRef.current = onPlay;
  onPauseRef.current = onPause;
  onSeekedRef.current = onSeeked;
  onEndedRef.current = onEnded;
  onPositionReaderChangeRef.current = onPositionReaderChange;

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
      const readPosition = () => toPositionMs(media);
      const play = () => {
        update();
        onPlayRef.current?.();
      };
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
        if (media.loop) return;
        onEndedRef.current?.();
      };

      media.addEventListener("timeupdate", update);
      media.addEventListener("play", play);
      media.addEventListener("pause", pause);
      media.addEventListener("seeking", seeking);
      media.addEventListener("seeked", seeked);
      media.addEventListener("ended", ended);
      onPositionReaderChangeRef.current?.(readPosition);
      cleanup = () => {
        onPositionReaderChangeRef.current?.(null);
        media.removeEventListener("timeupdate", update);
        media.removeEventListener("play", play);
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
