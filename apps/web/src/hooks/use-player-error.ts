import { useCallback, useEffect, useRef, useState } from "react";
import { bilibiliVariantCount } from "../lib/bilibili-manifest";
import { recordClientEvent } from "../lib/client-debug-log";
import { sanitizeVideoContext } from "../lib/debug-sanitize";
import { isIosDevice } from "../lib/ios-device";
import { detectProvider } from "../lib/provider";
import { claimAutomaticSabrRecovery, resetAutomaticSabrRecovery } from "../lib/sabr-error-recovery";
import {
  hasLegacyDashPair,
  hasSabrPlayback,
  legacyProgressiveStreams,
} from "../lib/stream-delivery";
import { resolveManifestSrc, shouldUseClassicHls } from "../lib/stream-src";
import type { MediaSrc } from "../lib/vidstack";
import type { VideoStream } from "../types/stream";
import { useInstance } from "./use-instance";
import { usePlaybackMode } from "./use-playback-mode";

type UsePlayerErrorReturn = {
  manifestSrc: MediaSrc;
  manifestLoading: boolean;
  sabrEnabled: boolean;
  playerFailed: boolean;
  qualityFailed: boolean;
  clearFailed: () => void;
  handleError: () => void;
  handleSeeking: (positionMs: number) => void;
  reset: () => void;
  retryKey: number;
  seekStartTime: number | null;
};

export function usePlayerError(stream: VideoStream, isLive: boolean): UsePlayerErrorReturn {
  const debugVideo = sanitizeVideoContext(stream.id) ?? "unknown";
  const provider = detectProvider(stream.id);
  const iosDevice = isIosDevice();
  const { data: instance } = useInstance();
  const { playbackMode } = usePlaybackMode();
  const playbackSourceId = stream.id.length === 0 ? "" : `${stream.id}:${playbackMode}`;
  const preferServerManifests = instance?.guestAllowed !== false;
  const legacyDashPair = hasLegacyDashPair(stream);
  const hasLegacyPlaybackFallback = legacyDashPair || legacyProgressiveStreams(stream).length > 0;
  const highQualityEnabled =
    !isLive &&
    !iosDevice &&
    preferServerManifests &&
    !stream.hlsUrl &&
    legacyDashPair &&
    provider === "youtube";
  const hlsEnabled = shouldUseClassicHls(stream.hlsUrl, isLive, false, legacyDashPair);
  const [hlsFailed, setHlsFailed] = useState(false);
  const [highQualityFailed, setHighQualityFailed] = useState(false);
  const [qualityFailed, setQualityFailed] = useState(false);
  const [compatibilityFallback, setCompatibilityFallback] = useState(false);
  const [bilibiliVariant, setBilibiliVariant] = useState(0);
  const [playerFailed, setPlayerFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const sabrRecoveryRef = useRef(false);
  const bilibiliVariants =
    provider === "bilibili"
      ? bilibiliVariantCount(stream.videoOnlyStreams ?? [], stream.audioStreams ?? [])
      : 0;
  const sabrSelected = provider === "youtube" && !isLive && playbackMode === "sabr";
  const sabrEnabled = sabrSelected && hasSabrPlayback(stream);

  const fallbackSrc = resolveManifestSrc(stream, isLive, qualityFailed, {
    compatibilityMode: compatibilityFallback,
    enableHighQualityPlayback: highQualityEnabled,
    highQualityFailed,
    hlsFailed,
    allowServerManifests: preferServerManifests,
    bilibiliVariant,
  });
  const manifestSrc: MediaSrc = sabrSelected ? { src: "", type: "video/mp4" } : fallbackSrc;
  const handleError = useCallback(() => {
    if (sabrSelected) {
      if (claimAutomaticSabrRecovery(sabrRecoveryRef)) {
        recordClientEvent("player.sabr_recovering", { video: debugVideo });
        setRetryKey((k) => k + 1);
        return;
      }
      recordClientEvent("player.sabr_failed", { video: debugVideo });
      setPlayerFailed(true);
    } else if (hlsEnabled && !hlsFailed) {
      recordClientEvent("player.hls_failed", { video: debugVideo });
      if (!hasLegacyPlaybackFallback) {
        setPlayerFailed(true);
        return;
      }
      setHlsFailed(true);
      setRetryKey((k) => k + 1);
    } else if (provider === "bilibili" && bilibiliVariant < bilibiliVariants - 1) {
      recordClientEvent("player.bilibili_variant_failed", { video: debugVideo });
      setBilibiliVariant((variant) => variant + 1);
      setRetryKey((k) => k + 1);
    } else if (highQualityEnabled && !highQualityFailed) {
      recordClientEvent("player.high_quality_failed", { video: debugVideo });
      setHighQualityFailed(true);
      setRetryKey((k) => k + 1);
    } else if (legacyDashPair && !qualityFailed) {
      recordClientEvent("player.quality_failed", { video: debugVideo });
      setQualityFailed(true);
      setRetryKey((k) => k + 1);
    } else if (!isLive && hasLegacyPlaybackFallback && !compatibilityFallback) {
      recordClientEvent("player.compatibility_fallback", { video: debugVideo });
      setCompatibilityFallback(true);
      setRetryKey((k) => k + 1);
    } else {
      recordClientEvent("player.failed", { video: debugVideo });
      setPlayerFailed(true);
    }
  }, [
    debugVideo,
    hlsEnabled,
    hlsFailed,
    sabrSelected,
    hasLegacyPlaybackFallback,
    provider,
    bilibiliVariant,
    bilibiliVariants,
    highQualityEnabled,
    highQualityFailed,
    legacyDashPair,
    qualityFailed,
    compatibilityFallback,
    isLive,
  ]);

  const reset = useCallback(() => {
    setHlsFailed(false);
    setHighQualityFailed(false);
    setQualityFailed(false);
    setCompatibilityFallback(false);
    setBilibiliVariant(0);
    setPlayerFailed(false);
    resetAutomaticSabrRecovery(sabrRecoveryRef);
    setRetryKey((k) => k + 1);
  }, []);

  const clearFailed = useCallback(() => setPlayerFailed(false), []);
  useEffect(() => {
    if (playbackSourceId.length === 0) return;
    setHlsFailed(false);
    setHighQualityFailed(false);
    setQualityFailed(false);
    setCompatibilityFallback(false);
    setBilibiliVariant(0);
    setPlayerFailed(false);
    resetAutomaticSabrRecovery(sabrRecoveryRef);
    setRetryKey(0);
  }, [playbackSourceId]);

  return {
    manifestSrc,
    manifestLoading: false,
    sabrEnabled,
    playerFailed,
    qualityFailed,
    clearFailed,
    handleError,
    handleSeeking: () => undefined,
    reset,
    retryKey,
    seekStartTime: null,
  };
}
