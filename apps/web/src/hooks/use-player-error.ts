import { useCallback, useEffect, useMemo, useState } from "react";
import { bilibiliVariantCount } from "../lib/bilibili-manifest";
import { recordClientEvent } from "../lib/client-debug-log";
import { sanitizeVideoContext } from "../lib/debug-sanitize";
import { isIosDevice } from "../lib/ios-device";
import { detectProvider } from "../lib/provider";
import { resolveManifestSrc } from "../lib/stream-src";
import type { MediaSrc } from "../lib/vidstack";
import type { VideoStream } from "../types/stream";

type UsePlayerErrorReturn = {
  manifestSrc: MediaSrc;
  playerFailed: boolean;
  qualityFailed: boolean;
  handleError: () => void;
  reset: () => void;
  retryKey: number;
};

function normalizeLanguageTag(value: string | null): string {
  if (value === null || value.length === 0) return "";
  const [base] = value.toLowerCase().split("-");
  return base ?? "";
}

function hasMultipleAudioLanguages(stream: VideoStream): boolean {
  const languages = new Set<string>();
  for (const track of stream.audioStreams ?? []) {
    const language = normalizeLanguageTag(track.audioLocale);
    if (!language) continue;
    languages.add(language);
    if (languages.size > 1) return true;
  }
  return false;
}

export function usePlayerError(
  stream: VideoStream,
  isLive: boolean,
  enableHighQualityPlayback = false,
): UsePlayerErrorReturn {
  const streamId = stream.id;
  const debugVideo = sanitizeVideoContext(streamId) ?? "unknown";
  const provider = detectProvider(stream.id);
  const iosDevice = isIosDevice();
  const preferNativeManifest = !iosDevice && !hasMultipleAudioLanguages(stream);
  const videoOnlyCount = stream.videoOnlyStreams?.length ?? 0;
  const highQualityEnabled =
    enableHighQualityPlayback &&
    !isLive &&
    !iosDevice &&
    !stream.hlsUrl &&
    videoOnlyCount > 0 &&
    provider === "youtube";
  const nativeEnabled = !isLive && videoOnlyCount > 0 && preferNativeManifest;
  const [highQualityFailed, setHighQualityFailed] = useState(false);
  const [nativeFailed, setNativeFailed] = useState(false);
  const [qualityFailed, setQualityFailed] = useState(false);
  const [compatibilityFallback, setCompatibilityFallback] = useState(false);
  const [bilibiliVariant, setBilibiliVariant] = useState(0);
  const [playerFailed, setPlayerFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const bilibiliVariants =
    provider === "bilibili"
      ? bilibiliVariantCount(stream.videoOnlyStreams ?? [], stream.audioStreams ?? [])
      : 0;

  const manifestSrc = useMemo(() => {
    if (compatibilityFallback) {
      return resolveManifestSrc(stream, isLive, nativeFailed, qualityFailed, {
        preferNativeManifest,
        compatibilityMode: true,
        enableHighQualityPlayback: highQualityEnabled,
        highQualityFailed,
        bilibiliVariant,
      });
    }
    return resolveManifestSrc(stream, isLive, nativeFailed, qualityFailed, {
      preferNativeManifest,
      enableHighQualityPlayback: highQualityEnabled,
      highQualityFailed,
      bilibiliVariant,
    });
  }, [
    stream,
    isLive,
    nativeFailed,
    qualityFailed,
    preferNativeManifest,
    compatibilityFallback,
    highQualityEnabled,
    highQualityFailed,
    bilibiliVariant,
  ]);

  const handleError = useCallback(() => {
    if (provider === "bilibili" && bilibiliVariant < bilibiliVariants - 1) {
      recordClientEvent("player.bilibili_variant_failed", { video: debugVideo });
      setBilibiliVariant((variant) => variant + 1);
      setRetryKey((k) => k + 1);
    } else if (highQualityEnabled && !highQualityFailed) {
      recordClientEvent("player.high_quality_failed", { video: debugVideo });
      setHighQualityFailed(true);
      setRetryKey((k) => k + 1);
    } else if (nativeEnabled && !nativeFailed) {
      recordClientEvent("player.native_manifest_failed", { video: debugVideo });
      setNativeFailed(true);
      setRetryKey((k) => k + 1);
    } else if (!qualityFailed) {
      recordClientEvent("player.quality_failed", { video: debugVideo });
      setQualityFailed(true);
      setRetryKey((k) => k + 1);
    } else if (!isLive && !compatibilityFallback) {
      recordClientEvent("player.compatibility_fallback", { video: debugVideo });
      setCompatibilityFallback(true);
      setRetryKey((k) => k + 1);
    } else {
      recordClientEvent("player.failed", { video: debugVideo });
      setPlayerFailed(true);
    }
  }, [
    debugVideo,
    provider,
    bilibiliVariant,
    bilibiliVariants,
    highQualityEnabled,
    highQualityFailed,
    nativeEnabled,
    nativeFailed,
    qualityFailed,
    compatibilityFallback,
    isLive,
  ]);

  const reset = useCallback(() => {
    setHighQualityFailed(false);
    setNativeFailed(false);
    setQualityFailed(false);
    setCompatibilityFallback(false);
    setBilibiliVariant(0);
    setPlayerFailed(false);
    setRetryKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (streamId.length === 0) return;
    setHighQualityFailed(false);
    setNativeFailed(false);
    setQualityFailed(false);
    setCompatibilityFallback(false);
    setBilibiliVariant(0);
    setPlayerFailed(false);
    setRetryKey(0);
  }, [streamId]);

  return { manifestSrc, playerFailed, qualityFailed, handleError, reset, retryKey };
}
