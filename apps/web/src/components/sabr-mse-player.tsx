import { TypeTypeMsePlayer, type TypeTypeMseQuality } from "@typetype/mse";
import { useEffect, useRef } from "react";
import { useLatestValue } from "../hooks/use-latest-value";
import { useSabrModeSwitch } from "../hooks/use-sabr-mode-switch";
import { useSabrQualitySwitch } from "../hooks/use-sabr-quality-switch";
import { toAbsoluteApiUrl } from "../lib/env";
import { isAbortError } from "../lib/sabr-playback-retry";
import { positionMs, runSabrSeek } from "../lib/sabr-player-seek";
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
  const engineRef = useRef<TypeTypeMsePlayer | null>(null);
  const qualityRef = useRef<TypeTypeMseQuality | null>(null);
  const pendingPlayRef = useRef(false);
  const autoplayStartedRef = useRef(false);
  const autoplayConfirmedRef = useRef(false);
  const seekingRef = useRef(false);
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
  useSabrQualitySwitch(config, engineRef, qualityRef, seekingRef);
  useSabrModeSwitch(config.audioOnly === true, engineRef, seekingRef, latestHandlers);
  useEffect(() => {
    if (!video || !settingsReady) return;
    video.volume = Math.min(1, Math.max(0, initialVolume));
    video.muted = initialMuted;
  }, [initialMuted, initialVolume, settingsReady, video]);
  useEffect(() => {
    if (!video) return;
    const initialConfig = latestConfig();
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const engine = new TypeTypeMsePlayer(video, {
      endpoint: toAbsoluteApiUrl(""),
      videoId: config.videoId,
      videoItag: initialConfig.videoItag,
      audioItag: initialConfig.audioItag,
      audioTrackId: initialConfig.audioTrackId,
      audioOnly: initialConfig.audioOnly,
      startTimeMs: Math.max(0, Math.round(latestStartTime())),
      headers,
    });
    engineRef.current = engine;
    qualityRef.current = {
      videoItag: initialConfig.videoItag,
      audioItag: initialConfig.audioItag,
      audioTrackId: initialConfig.audioTrackId,
    };
    const offError = engine.on("error", () => latestHandlers().onError());
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
        runSabrSeek(
          engine,
          Math.max(0, Math.round(seconds * 1000)),
          seekingRef,
          latestHandlers().onError,
          latestHandlers().onSeekStateChange,
        );
      },
    });
    void engine
      .load()
      .then(() => {
        engineLoaded = true;
        startAutoplay();
      })
      .catch((error: unknown) => {
        if (!isAbortError(error)) latestHandlers().onError();
      });
    latestHandlers().onSeekReady((seconds) =>
      runSabrSeek(
        engine,
        Math.max(0, Math.round(seconds * 1000)),
        seekingRef,
        latestHandlers().onError,
        latestHandlers().onSeekStateChange,
      ),
    );
    latestHandlers().onPositionReaderChange(() => positionMs(video));
    return () => {
      offError();
      unregisterControls();
      video.removeEventListener("volumechange", volumeChange);
      video.removeEventListener("canplay", startAutoplay);
      window.clearInterval(autoplayTimer);
      engine.destroy();
      engineRef.current = null;
      pendingPlayRef.current = false;
      autoplayStartedRef.current = false;
      autoplayConfirmedRef.current = false;
      seekingRef.current = false;
      latestHandlers().onSeekStateChange(false);
      video.autoplay = false;
      latestHandlers().onPositionReaderChange(null);
    };
  }, [config.videoId, latestConfig, latestHandlers, latestStartTime, token, video]);
  return null;
}
