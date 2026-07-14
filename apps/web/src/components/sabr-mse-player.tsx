import { TypeTypeMsePlayer, type TypeTypeMseQuality } from "@typetype/mse";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLatestValue } from "../hooks/use-latest-value";
import { useSabrModeSwitch } from "../hooks/use-sabr-mode-switch";
import { useSabrQualitySwitch } from "../hooks/use-sabr-quality-switch";
import { recordClientEvent } from "../lib/client-debug-log";
import { toAbsoluteApiUrl } from "../lib/env";
import { isAbortError } from "../lib/sabr-playback-retry";
import { cancelPendingSabrSeek, positionMs, runSabrSeek } from "../lib/sabr-player-seek";
import { registerSabrVidstackControls } from "../lib/sabr-vidstack-bridge";
import { useAuthStore } from "../stores/auth-store";
import type { SabrMsePlayerProps } from "./sabr-mse-player-types";

export function SabrMsePlayer({
  config,
  video,
  startTime,
  autoplay,
  initialVolume,
  initialMuted,
  settingsReady,
  onVolumeChange,
  onError,
  onSeekStateChange,
  onSeekReady,
  onPositionReaderChange,
}: SabrMsePlayerProps) {
  const token = useAuthStore((state) => state.token);
  const headersRef = useRef(new Headers());
  if (token) headersRef.current.set("authorization", `Bearer ${token}`);
  else headersRef.current.delete("authorization");
  const engineRef = useRef<TypeTypeMsePlayer | null>(null);
  const qualityRef = useRef<TypeTypeMseQuality | null>(null);
  const pendingPlayRef = useRef(false);
  const autoplayStartedRef = useRef(false);
  const autoplayConfirmedRef = useRef(false);
  const seekingRef = useRef(false);
  const errorReportedRef = useRef(false);
  const [engineReady, setEngineReady] = useState(false);
  const latestConfig = useLatestValue(config);
  const latestStartTime = useLatestValue(startTime);
  const latestHandlers = useLatestValue({
    autoplay,
    onError,
    onSeekStateChange,
    onSeekReady,
    onPositionReaderChange,
    onVolumeChange,
  });
  const reportError = useCallback(
    (error: unknown, recoveryPositionMs?: number) => {
      if (errorReportedRef.current) return;
      errorReportedRef.current = true;
      const message = error instanceof Error ? error.message : String(error);
      recordClientEvent("player.sabr_engine_error", {
        error: message,
        recoveryPositionMs,
      });
      latestHandlers().onError(recoveryPositionMs);
    },
    [latestHandlers],
  );
  const latestEngineHandlers = useCallback(() => {
    const handlers = latestHandlers();
    return {
      onError: reportError,
      onSeekStateChange: handlers.onSeekStateChange,
    };
  }, [latestHandlers, reportError]);
  useSabrQualitySwitch(config, engineReady, engineRef, qualityRef, seekingRef);
  useSabrModeSwitch(config.audioOnly === true, engineRef, seekingRef, latestEngineHandlers);
  useEffect(() => {
    if (!video || !settingsReady) return;
    video.volume = Math.min(1, Math.max(0, initialVolume));
    video.muted = initialMuted;
  }, [initialMuted, initialVolume, settingsReady, video]);
  useEffect(() => {
    if (!video) return;
    errorReportedRef.current = false;
    const initialConfig = latestConfig();
    const engine = new TypeTypeMsePlayer(video, {
      endpoint: toAbsoluteApiUrl(""),
      videoId: config.videoId,
      videoItag: initialConfig.videoItag,
      audioItag: initialConfig.audioItag,
      audioTrackId: initialConfig.audioTrackId,
      audioOnly: initialConfig.audioOnly,
      startTimeMs: Math.max(0, Math.round(latestStartTime())),
      headers: headersRef.current,
    });
    engineRef.current = engine;
    qualityRef.current = {
      videoItag: initialConfig.videoItag,
      audioItag: initialConfig.audioItag,
      audioTrackId: initialConfig.audioTrackId,
    };
    const offError = engine.on("error", (event) => {
      if (event.type === "error") reportError(event.error, event.recoveryPositionMs);
    });
    const volumeChange = () => latestHandlers().onVolumeChange?.(video.volume, video.muted);
    video.addEventListener("volumechange", volumeChange);
    let autoplayStartTime = 0;
    let engineLoaded = false;
    const startAutoplay = () => {
      if (!engineLoaded || autoplayConfirmedRef.current || video.readyState < 3) return;
      if (autoplayStartedRef.current) {
        if (!video.paused && video.currentTime >= autoplayStartTime + 0.25) {
          autoplayConfirmedRef.current = true;
        } else if (video.paused) {
          autoplayStartedRef.current = false;
        }
        return;
      }
      if (!latestHandlers().autoplay && !pendingPlayRef.current) return;
      autoplayStartTime = video.currentTime;
      autoplayStartedRef.current = true;
      void engine.play().catch(() => {
        autoplayStartedRef.current = false;
      });
    };
    video.addEventListener("canplay", startAutoplay);
    const autoplayTimer = window.setInterval(startAutoplay, 250);
    const unregisterControls = registerSabrVidstackControls(video, {
      play: () => {
        pendingPlayRef.current = true;
        video.autoplay = true;
        return engine.play();
      },
      pause: (userInitiated = false) => {
        if (!userInitiated && pendingPlayRef.current && !autoplayConfirmedRef.current) return;
        pendingPlayRef.current = false;
        autoplayConfirmedRef.current = true;
        video.autoplay = false;
        return engine.pause();
      },
      seek: (seconds) => {
        const targetMs = Math.max(0, Math.round(seconds * 1000));
        runSabrSeek(engine, targetMs, seekingRef, reportError, latestHandlers().onSeekStateChange);
      },
    });
    void engine
      .load()
      .then(() => {
        engineLoaded = true;
        setEngineReady(true);
        startAutoplay();
      })
      .catch((error: unknown) => {
        if (!isAbortError(error)) reportError(error);
      });
    latestHandlers().onSeekReady((seconds) => {
      const targetMs = Math.max(0, Math.round(seconds * 1000));
      runSabrSeek(engine, targetMs, seekingRef, reportError, latestHandlers().onSeekStateChange);
    });
    latestHandlers().onPositionReaderChange(() => positionMs(video));
    return () => {
      offError();
      unregisterControls();
      video.removeEventListener("volumechange", volumeChange);
      video.removeEventListener("canplay", startAutoplay);
      window.clearInterval(autoplayTimer);
      engine.destroy();
      engineRef.current = null;
      setEngineReady(false);
      pendingPlayRef.current = false;
      autoplayStartedRef.current = false;
      autoplayConfirmedRef.current = false;
      cancelPendingSabrSeek(seekingRef);
      seekingRef.current = false;
      latestHandlers().onSeekStateChange(false);
      video.autoplay = false;
      latestHandlers().onPositionReaderChange(null);
    };
  }, [config.videoId, latestConfig, latestHandlers, latestStartTime, reportError, video]);
  return null;
}
