import { BadgeInfo, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  getSponsorBlockCategoryLabel,
  getSponsorBlockEndTime,
  getSponsorBlockStartTime,
} from "../lib/sponsorblock-settings";
import { useMediaPlayer, useMediaRemote } from "../lib/vidstack";
import type { SponsorBlockSegmentItem } from "../types/api";

type Props = {
  segments: SponsorBlockSegmentItem[];
  autoSkipSegments?: SponsorBlockSegmentItem[];
  manualSkipSegments?: SponsorBlockSegmentItem[];
  muteInsteadOfSkip: boolean;
};

type ActiveSegment = {
  segment: SponsorBlockSegmentItem;
  duration: number;
};

function includesSegment(
  segments: SponsorBlockSegmentItem[] | undefined,
  segment: SponsorBlockSegmentItem,
) {
  return segments?.some(
    (item) => item.category === segment.category && item.startTime === segment.startTime,
  );
}

export function SponsorBlockCurrentSegment({
  segments,
  autoSkipSegments,
  manualSkipSegments,
  muteInsteadOfSkip,
}: Props) {
  const remote = useMediaRemote();
  const player = useMediaPlayer();
  const [active, setActive] = useState<ActiveSegment | null>(null);
  const activeKeyRef = useRef("");

  useEffect(() => {
    const root = player?.el;
    if (!root) return;
    const rootElement = root;
    let cleanup: (() => void) | null = null;

    function updateActive(media: HTMLMediaElement) {
      const duration = Number.isFinite(media.duration) ? media.duration : 0;
      const currentTime = Number.isFinite(media.currentTime) ? media.currentTime : 0;
      const segment = segments.find(
        (item) =>
          currentTime >= getSponsorBlockStartTime(item, duration) &&
          currentTime < getSponsorBlockEndTime(item, duration),
      );
      const nextKey = segment ? `${segment.category}:${segment.startTime}:${duration}` : "";
      if (nextKey === activeKeyRef.current) return;
      activeKeyRef.current = nextKey;
      setActive(segment ? { segment, duration } : null);
    }

    function attach() {
      if (cleanup) return true;
      const media = rootElement.querySelector<HTMLMediaElement>("video,audio");
      if (!media) return false;
      const update = () => updateActive(media);
      media.addEventListener("timeupdate", update);
      media.addEventListener("seeking", update);
      media.addEventListener("durationchange", update);
      media.addEventListener("loadedmetadata", update);
      update();
      cleanup = () => {
        media.removeEventListener("timeupdate", update);
        media.removeEventListener("seeking", update);
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
  }, [player, segments]);

  if (!active) return null;
  const { segment: current, duration } = active;
  const autoSkip = includesSegment(autoSkipSegments, current);
  const canSkip = includesSegment(manualSkipSegments, current) || !autoSkip || muteInsteadOfSkip;

  const label = getSponsorBlockCategoryLabel(current.category);

  return (
    <div className="absolute left-3 top-3 z-40 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-xl border border-white/15 bg-black/75 px-2.5 py-2 text-xs text-white shadow-lg backdrop-blur sm:left-auto sm:right-4 sm:top-4 sm:max-w-[min(22rem,calc(100%-2rem))] sm:rounded-full sm:px-3">
      <BadgeInfo className="h-4 w-4 flex-shrink-0 text-white/80" aria-hidden="true" />
      <div className="min-w-0 leading-tight">
        <div className="truncate font-medium">{label}</div>
        <div className="hidden text-[10px] uppercase tracking-wide text-white/55 sm:block">
          SponsorBlock
        </div>
      </div>
      {canSkip && (
        <button
          type="button"
          onClick={() => remote.seek(getSponsorBlockEndTime(current, duration))}
          className="ml-1 inline-flex flex-shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-black transition-colors hover:bg-white/85"
        >
          <SkipForward className="h-3.5 w-3.5" aria-hidden="true" />
          Skip
        </button>
      )}
    </div>
  );
}
