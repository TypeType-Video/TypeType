import { useEffect, useMemo, useState } from "react";
import { bestSabrItag, browserSabrCodecProbe } from "../lib/sabr-codec-capabilities";
import {
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
  const [defaultItag, setDefaultItag] = useState<number | null>(null);
  const effectiveItag = selectedItag ?? defaultItag;
  useEffect(() => {
    let active = true;
    if (!enabled) return;
    setDefaultItag(null);
    void bestSabrItag(options, defaultQuality, browserSabrCodecProbe()).then((itag) => {
      if (active) setDefaultItag(itag);
    });
    return () => {
      active = false;
    };
  }, [defaultQuality, enabled, options]);
  useEffect(() => {
    if (!enabled || defaultItag === null) return;
    setOptions(stream.id, options, defaultItag);
  }, [defaultItag, enabled, options, setOptions, stream.id]);
  const config = useMemo(() => {
    const config = resolveSabrPlaybackConfig(stream, effectiveItag);
    return config ? { ...config, key: `${config.key}:${authScope}` } : null;
  }, [authScope, effectiveItag, stream]);
  return enabled ? config : null;
}
