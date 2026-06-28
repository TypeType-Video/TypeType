import { useMemo } from "react";
import { isAudioOnlyUnavailable, toAudioOnlyMediaSrc } from "../lib/api-audio-only";
import type { MediaSrc } from "../lib/vidstack";
import type { VideoStream } from "../types/stream";
import type { SettingsItem } from "../types/user";
import { useAudioOnlyStream } from "./use-audio-only-stream";

type WatchAudioOnlySource = {
  enabled: boolean;
  loading: boolean;
  src: MediaSrc | null;
  unavailable: boolean;
};

export function useWatchAudioOnlySource(
  stream: VideoStream,
  settings: SettingsItem,
  isLive: boolean,
): WatchAudioOnlySource {
  const enabled = settings.audioOnlyPlayback && !isLive;
  const query = useAudioOnlyStream(
    stream.id,
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
