import { BadgeInfo, SkipForward } from "lucide-react";
import {
  getSponsorBlockCategoryLabel,
  getSponsorBlockEndTime,
  getSponsorBlockStartTime,
} from "../lib/sponsorblock-settings";
import { useMediaRemote, useMediaState } from "../lib/vidstack";
import type { SponsorBlockSegmentItem } from "../types/api";

type Props = {
  segments: SponsorBlockSegmentItem[];
  autoSkipSegments?: SponsorBlockSegmentItem[];
  manualSkipSegments?: SponsorBlockSegmentItem[];
  muteInsteadOfSkip: boolean;
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
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");
  const current = segments.find(
    (segment) =>
      currentTime >= getSponsorBlockStartTime(segment, duration) &&
      currentTime < getSponsorBlockEndTime(segment, duration),
  );

  if (!current) return null;
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
