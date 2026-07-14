import { useEffect, useMemo } from "react";
import { defaultSabrAudioTrackId, sabrAudioOptions } from "../lib/sabr-audio";
import {
  automaticSabrQuality,
  defaultSabrItag,
  resolveSabrPlaybackConfig,
  type SabrPlaybackConfig,
  sabrQualityOptions,
} from "../lib/sabr-source";
import { useAuthStore } from "../stores/auth-store";
import { useSabrAudioStore } from "../stores/sabr-audio-store";
import { useSabrQualityStore } from "../stores/sabr-quality-store";
import type { VideoStream } from "../types/stream";

export function useSabrPlaybackConfig(
  stream: VideoStream,
  enabled: boolean,
  defaultQuality?: string,
  defaultAudioLanguage?: string,
  audioOnly = false,
): SabrPlaybackConfig | null {
  const authScope = useAuthStore((state) => (state.token ? (state.me?.id ?? "auth") : "guest"));
  const selectedItag = useSabrQualityStore((state) =>
    state.streamId === stream.id && state.manuallySelected ? state.selectedItag : null,
  );
  const setOptions = useSabrQualityStore((state) => state.setOptions);
  const selectedTrackId = useSabrAudioStore((state) =>
    state.streamId === stream.id ? state.selectedTrackId : null,
  );
  const setAudioOptions = useSabrAudioStore((state) => state.setOptions);
  const options = useMemo(() => sabrQualityOptions(stream), [stream]);
  const audioOptions = useMemo(() => sabrAudioOptions(stream), [stream]);
  const fallbackTrackId = useMemo(
    () => defaultSabrAudioTrackId(stream, defaultAudioLanguage),
    [defaultAudioLanguage, stream],
  );
  const effectiveTrackId = selectedTrackId ?? fallbackTrackId;
  const preferredQuality = resolvePreferredQuality(defaultQuality);
  const defaultItag = useMemo(
    () => defaultSabrItag(options, preferredQuality),
    [options, preferredQuality],
  );
  const effectiveItag = selectedItag ?? defaultItag;
  useEffect(() => {
    if (!enabled || defaultItag === null) return;
    setOptions(stream.id, options, defaultItag);
  }, [defaultItag, enabled, options, setOptions, stream.id]);
  useEffect(() => {
    if (!enabled) return;
    setAudioOptions(stream.id, audioOptions, fallbackTrackId);
  }, [audioOptions, enabled, fallbackTrackId, setAudioOptions, stream.id]);
  const config = useMemo(() => {
    const config = resolveSabrPlaybackConfig(stream, effectiveItag, effectiveTrackId, audioOnly);
    return config ? { ...config, key: `${config.key}:${authScope}` } : null;
  }, [audioOnly, authScope, effectiveItag, effectiveTrackId, stream]);
  return enabled ? config : null;
}

type NetworkInformation = {
  effectiveType?: string;
  saveData?: boolean;
};

function resolvePreferredQuality(defaultQuality: string | undefined): string | undefined {
  if (defaultQuality?.toLowerCase() !== "auto" || typeof window === "undefined") {
    return defaultQuality;
  }
  const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection;
  return automaticSabrQuality(
    window.screen.height,
    window.devicePixelRatio,
    connection?.saveData,
    connection?.effectiveType,
  );
}
