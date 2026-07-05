import { useMemo } from "react";
import { isAudioOnlyUnavailable, toAudioOnlyMediaSrc } from "../lib/api-audio-only";
import type { MediaSrc } from "../lib/vidstack";
import type { SettingsItem } from "../types/user";
import { useAudioOnlyStream } from "./use-audio-only-stream";

type WatchAudioOnlySource = {
  enabled: boolean;
  loading: boolean;
  src: MediaSrc | null;
  unavailable: boolean;
};

export function useWatchAudioOnlySource(
  sourceUrl: string,
  settings: SettingsItem,
  isLive: boolean,
  active = settings.audioOnlyPlayback,
): WatchAudioOnlySource {
  const enabled = active && !isLive;
  const query = useAudioOnlyStream(
    sourceUrl,
    settings.preferOriginalLanguage,
    settings.defaultAudioLanguage,
    enabled,
  );
  const src = useMemo(
    () => (enabled && query.data ? toAudioOnlyMediaSrc(query.data) : null),
    [enabled, query.data],
  );
  return {
    enabled,
    loading: enabled && query.isLoading,
    src,
    unavailable: enabled && isAudioOnlyUnavailable(query.error),
  };
}
