import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ApiError } from "../lib/api";
import { resolveSabrPlaybackSrc, sabrQualityOptions } from "../lib/sabr-source";
import type { MediaSrc } from "../lib/vidstack";
import { useAuthStore } from "../stores/auth-store";
import { useSabrQualityStore } from "../stores/sabr-quality-store";
import type { VideoStream } from "../types/stream";

type SabrPlaybackState = {
  sessionId: string;
  src: MediaSrc;
};

type SabrManifestSrc = {
  src: MediaSrc | null;
  loading: boolean;
  failed: boolean;
};

export function useSabrManifestSrc(
  stream: VideoStream,
  enabled: boolean,
  playerTimeMs: number | null,
): SabrManifestSrc {
  const authScope = useAuthStore((state) => (state.token ? (state.me?.id ?? "auth") : "guest"));
  const selectedItag = useSabrQualityStore((state) =>
    state.streamId === stream.id ? state.selectedItag : null,
  );
  const setOptions = useSabrQualityStore((state) => state.setOptions);
  const defaultItag = sabrQualityOptions(stream)[0]?.itag ?? null;
  const effectiveItag = selectedItag ?? defaultItag;
  const lastSrcRef = useRef<MediaSrc | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const lastSrcKeyRef = useRef<string | null>(null);
  const srcKey = `${stream.id}:${effectiveItag ?? "auto"}:${authScope}`;
  if (lastSrcKeyRef.current !== srcKey) {
    lastSrcRef.current = null;
    sessionIdRef.current = null;
    lastSrcKeyRef.current = srcKey;
  }
  useEffect(() => {
    if (!enabled) return;
    const options = sabrQualityOptions(stream);
    setOptions(stream.id, options, options[0]?.itag ?? null);
  }, [enabled, setOptions, stream]);
  const query = useQuery({
    queryKey: ["sabr-manifest", stream.id, effectiveItag, authScope, playerTimeMs],
    queryFn: async (): Promise<SabrPlaybackState | null> => {
      const playback = await resolveSabrPlaybackSrc(
        stream,
        effectiveItag,
        playerTimeMs,
        sessionIdRef.current,
      );
      if (!playback) return null;
      sessionIdRef.current = playback.sessionId;
      return playback;
    },
    enabled,
    staleTime: 3 * 60 * 1000,
    retry: (count, error) =>
      error instanceof ApiError && (error.status === 202 || error.status === 422) && count < 5,
    retryDelay: (attempt) => Math.min(500 * 2 ** attempt, 4000),
  });
  if (query.data) lastSrcRef.current = query.data.src;
  const fetching = query.fetchStatus !== "idle";
  return {
    src: query.data?.src ?? lastSrcRef.current,
    loading: enabled && fetching && (!lastSrcRef.current || playerTimeMs !== null),
    failed: enabled && (query.isError || (query.isSuccess && !query.data && !lastSrcRef.current)),
  };
}
