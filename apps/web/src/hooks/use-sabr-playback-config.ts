import { useEffect, useMemo, useState } from "react";
import { bestSabrItag, browserSabrCodecProbe } from "../lib/sabr-codec-capabilities";
import {
  automaticSabrQuality,
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
  const startupItag = useMemo(() => defaultSabrItag(options, "720p"), [options]);
  const [defaultItag, setDefaultItag] = useState<number | null>(null);
  const effectiveItag = selectedItag ?? defaultItag ?? startupItag;
  useEffect(() => {
    let active = true;
    if (!enabled) return;
    setDefaultItag(null);
    const quality = resolvePreferredQuality(defaultQuality);
    void bestSabrItag(options, quality, browserSabrCodecProbe()).then((itag) => {
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
