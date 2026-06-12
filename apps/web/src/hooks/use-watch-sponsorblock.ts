import { useMemo } from "react";
import {
  filterAutoSkipSponsorBlockSegments,
  filterManualSponsorBlockSegments,
  filterSponsorBlockSegments,
} from "../lib/sponsorblock-settings";
import type { VideoStream } from "../types/stream";
import type { SettingsItem } from "../types/user";

export function useWatchSponsorBlock(stream: VideoStream, settings: SettingsItem) {
  const segments = useMemo(
    () => filterSponsorBlockSegments(stream.sponsorBlockSegments, settings, stream.duration),
    [stream.sponsorBlockSegments, stream.duration, settings],
  );
  const autoSkipSegments = useMemo(
    () => filterAutoSkipSponsorBlockSegments(segments, settings, stream.duration, stream.category),
    [segments, settings, stream.duration, stream.category],
  );
  const manualSkipSegments = useMemo(
    () => filterManualSponsorBlockSegments(segments, settings, stream.duration),
    [segments, settings, stream.duration],
  );

  return {
    segments,
    autoSkipSegments,
    manualSkipSegments,
  };
}
