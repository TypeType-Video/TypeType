import { useEffect, useRef } from "react";
import { useAudioOptions, useMediaState, useVideoQualityOptions } from "../lib/vidstack";
import { includesOriginal, normalizeLanguageTag } from "./player-language";

const QUALITY_OPTIONS = { sort: "descending" } as const;

type PlayerDefaultsProps = {
  defaultQuality?: string;
  defaultAudioLanguage?: string;
  preferOriginalLanguage?: boolean;
  requireOriginalLanguage?: boolean;
  onOriginalLanguageUnavailable?: () => void;
  originalAudioTrackId?: string | null;
  preferredDefaultAudioTrackId?: string | null;
  originalAudioLocale?: string | null;
  subtitlesEnabled?: boolean;
  defaultSubtitleLanguage?: string;
};

function qualityLabelHeight(label: string): number | null {
  const match = label.match(/(\d+)/);
  if (!match) return null;
  const height = Number(match[1]);
  return Number.isFinite(height) ? height : null;
}

export function PlayerDefaults({
  defaultQuality,
  defaultAudioLanguage,
  preferOriginalLanguage,
  requireOriginalLanguage,
  onOriginalLanguageUnavailable,
  originalAudioTrackId,
  preferredDefaultAudioTrackId,
  originalAudioLocale,
  subtitlesEnabled,
  defaultSubtitleLanguage,
}: PlayerDefaultsProps) {
  const canPlay = useMediaState("canPlay");
  const qualityOptions = useVideoQualityOptions(QUALITY_OPTIONS);
  const audioOptions = useAudioOptions();
  const textTracks = useMediaState("textTracks");
  const qualityApplied = useRef(false);
  const appliedAudioOptionsCount = useRef(0);
  const subtitleApplied = useRef(false);
  const originalMissingNotified = useRef(false);

  const preferredTag = normalizeLanguageTag(defaultAudioLanguage);
  const originalTag = normalizeLanguageTag(originalAudioLocale);

  useEffect(() => {
    if (!canPlay || qualityApplied.current || !defaultQuality) return;
    const defaultHeight = qualityLabelHeight(defaultQuality);
    const exactMatch = qualityOptions.find((o) => o.label === defaultQuality);
    const heightMatch = qualityOptions.find(
      (o) => defaultHeight !== null && o.quality?.height === defaultHeight,
    );
    const match = exactMatch ?? heightMatch;
    if (!match) return;
    match.select();
    qualityApplied.current = true;
  }, [canPlay, qualityOptions, defaultQuality]);

  useEffect(() => {
    const forceOriginal = requireOriginalLanguage || preferOriginalLanguage;
    const canReapplyOriginalSelection =
      forceOriginal &&
      appliedAudioOptionsCount.current > 0 &&
      audioOptions.length > appliedAudioOptionsCount.current;
    const selectedTrackId = audioOptions.find((option) => option.selected)?.track.id;
    const expectedTrackId = forceOriginal
      ? (originalAudioTrackId ?? preferredDefaultAudioTrackId ?? undefined)
      : (preferredDefaultAudioTrackId ?? undefined);
    const shouldFixMismatchedSelection =
      expectedTrackId !== undefined &&
      expectedTrackId !== null &&
      selectedTrackId !== undefined &&
      selectedTrackId !== expectedTrackId;
    if (
      audioOptions.length === 0 ||
      (appliedAudioOptionsCount.current > 0 &&
        !canReapplyOriginalSelection &&
        !shouldFixMismatchedSelection)
    ) {
      return;
    }

    let match = forceOriginal
      ? (audioOptions.find((option) => option.track.id === originalAudioTrackId) ??
        audioOptions.find((option) => option.track.id === preferredDefaultAudioTrackId) ??
        audioOptions.find((option) => includesOriginal(option.label)) ??
        audioOptions.find((option) => normalizeLanguageTag(option.track.language) === originalTag))
      : (audioOptions.find((option) => option.track.id === preferredDefaultAudioTrackId) ??
        audioOptions.find((option) => option.track.id === originalAudioTrackId));

    const missingOriginalByContract = forceOriginal && originalAudioTrackId === null;
    const missingOriginalByHeuristic =
      forceOriginal && originalAudioTrackId === undefined && !match;
    if (
      (missingOriginalByContract || missingOriginalByHeuristic) &&
      !originalMissingNotified.current
    ) {
      originalMissingNotified.current = true;
      onOriginalLanguageUnavailable?.();
    }

    if (!match) {
      match = audioOptions.find(
        (option) => normalizeLanguageTag(option.track.language) === preferredTag,
      );
    }
    if (!match) {
      match = audioOptions[0];
    }
    if (!match || selectedTrackId === match.track.id) return;

    match.select();
    appliedAudioOptionsCount.current = audioOptions.length;
  }, [
    audioOptions,
    originalAudioTrackId,
    preferredDefaultAudioTrackId,
    preferOriginalLanguage,
    requireOriginalLanguage,
    originalTag,
    preferredTag,
    onOriginalLanguageUnavailable,
  ]);

  useEffect(() => {
    if (!canPlay || subtitleApplied.current || !subtitlesEnabled) return;
    for (const track of textTracks) {
      if (track.kind !== "subtitles" && track.kind !== "captions") continue;
      if (defaultSubtitleLanguage && track.language !== defaultSubtitleLanguage) continue;
      track.setMode("showing");
      subtitleApplied.current = true;
      break;
    }
  }, [canPlay, textTracks, subtitlesEnabled, defaultSubtitleLanguage]);

  return null;
}
