import { useEffect, useMemo } from "react";
import {
  defaultSabrItag,
  resolveSabrPlaybackConfig,
  type SabrPlaybackConfig,
  sabrQualityOptions,
} from "../lib/sabr-source";
import { useAuthStore } from "../stores/auth-store";
import { useSabrQualityStore } from "../stores/sabr-quality-store";
import type { VideoStream } from "../types/stream";

export function useSabrPlaybackConfig(
  stream: VideoStream,
  enabled: boolean,
  defaultQuality?: string,
): SabrPlaybackConfig | null {
  const authScope = useAuthStore((state) => (state.token ? (state.me?.id ?? "auth") : "guest"));
  const selectedItag = useSabrQualityStore((state) =>
    state.streamId === stream.id ? state.selectedItag : null,
  );
  const setOptions = useSabrQualityStore((state) => state.setOptions);
  const options = useMemo(() => sabrQualityOptions(stream), [stream]);
  const defaultItag = useMemo(
    () => defaultSabrItag(options, defaultQuality),
    [defaultQuality, options],
  );
  const effectiveItag = selectedItag ?? defaultItag;
  useEffect(() => {
    if (!enabled) return;
    setOptions(stream.id, options, defaultItag);
  }, [defaultItag, enabled, options, setOptions, stream.id]);
  const config = useMemo(() => {
    const config = resolveSabrPlaybackConfig(stream, effectiveItag);
    return config ? { ...config, key: `${config.key}:${authScope}` } : null;
  }, [authScope, effectiveItag, stream]);
  return enabled ? config : null;
}
