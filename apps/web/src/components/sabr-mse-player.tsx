import { TypeTypeMsePlayer, type TypeTypeMseQuality } from "@typetype/mse";
import { useEffect, useRef } from "react";
import { useLatestValue } from "../hooks/use-latest-value";
import { useSabrQualitySwitch } from "../hooks/use-sabr-quality-switch";
import { toAbsoluteApiUrl } from "../lib/env";
import { isAbortError, playWithMuteFallback } from "../lib/sabr-playback-retry";
import type { SabrPlaybackConfig } from "../lib/sabr-source";
import { registerSabrVidstackControls } from "../lib/sabr-vidstack-bridge";
import { useAuthStore } from "../stores/auth-store";

type Props = {
  config: SabrPlaybackConfig;
  video: HTMLVideoElement | null;
  startTime: number;
  autoplay: boolean;
  initialVolume: number;
  initialMuted: boolean;
  settingsReady: boolean;
  onVolumeChange?: (volume: number, muted: boolean) => void;
  onError: () => void;
  onSeekReady: (seek: (seconds: number) => void) => void;
  onPositionReaderChange: (reader: (() => number | null) | null) => void;
};

function positionMs(video: HTMLVideoElement): number {
  return Math.max(0, Math.round(video.currentTime * 1000));
}

function runSeek(
  player: TypeTypeMsePlayer | null,
  position: number,
  flag: { current: boolean },
  onError: () => void,
) {
  flag.current = true;
  void player
    ?.seek(position)
    .catch((error: unknown) => {
      if (!isAbortError(error)) onError();
    })
    .finally(() => {
      flag.current = false;
    });
}

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
  onSeekReady,
  onPositionReaderChange,
}: Props) {
  const token = useAuthStore((state) => state.token);
  const engineRef = useRef<TypeTypeMsePlayer | null>(null);
  const qualityRef = useRef<TypeTypeMseQuality | null>(null);
  const pendingPlayRef = useRef(false);
  const autoplayStartedRef = useRef(false);
  const autoplayConfirmedRef = useRef(false);
  const seekingRef = useRef(false);
  const latestConfig = useLatestValue(config);
  const latestHandlers = useLatestValue({
    autoplay,
    onError,
    onSeekReady,
    onPositionReaderChange,
    onVolumeChange,
  });
  useSabrQualitySwitch(config, engineRef, qualityRef, seekingRef);
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
      startTimeMs: Math.max(0, Math.round(startTime)),
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
    let ignoreInitialZeroSeek = startTime > 0;
    const playerRoot = video.parentElement?.parentElement;
    const acceptSeekIntent = () => {
      ignoreInitialZeroSeek = false;
    };
    video.addEventListener("volumechange", volumeChange);
    playerRoot?.addEventListener("pointerdown", acceptSeekIntent, true);
    playerRoot?.addEventListener("keydown", acceptSeekIntent, true);
    let autoplayStartTime = 0;
    const startAutoplay = () => {
      if (autoplayConfirmedRef.current || video.readyState < 3) return;
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
      void playWithMuteFallback(engine, video).catch(() => {
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
      pause: () => {
        pendingPlayRef.current = false;
        autoplayConfirmedRef.current = true;
        video.autoplay = false;
        return engine.pause();
      },
      seek: (seconds) => {
        if (ignoreInitialZeroSeek && seconds === 0) {
          ignoreInitialZeroSeek = false;
          return;
        }
        ignoreInitialZeroSeek = false;
        runSeek(
          engine,
          Math.max(0, Math.round(seconds * 1000)),
          seekingRef,
          latestHandlers().onError,
        );
      },
    });
    void engine
      .load()
      .then(startAutoplay)
      .catch((error: unknown) => {
        if (!isAbortError(error)) latestHandlers().onError();
      });
    latestHandlers().onSeekReady((seconds) =>
      runSeek(
        engine,
        Math.max(0, Math.round(seconds * 1000)),
        seekingRef,
        latestHandlers().onError,
      ),
    );
    latestHandlers().onPositionReaderChange(() => positionMs(video));
    return () => {
      offError();
      unregisterControls();
      video.removeEventListener("volumechange", volumeChange);
      playerRoot?.removeEventListener("pointerdown", acceptSeekIntent, true);
      playerRoot?.removeEventListener("keydown", acceptSeekIntent, true);
      video.removeEventListener("canplay", startAutoplay);
      window.clearInterval(autoplayTimer);
      engine.destroy();
      engineRef.current = null;
      pendingPlayRef.current = false;
      autoplayStartedRef.current = false;
      autoplayConfirmedRef.current = false;
      video.autoplay = false;
      latestHandlers().onPositionReaderChange(null);
    };
  }, [config.videoId, latestConfig, latestHandlers, startTime, token, video]);
  return null;
}
