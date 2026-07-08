import { TypeTypeMsePlayer, type TypeTypeMseQuality } from "@typetype/mse";
import { useEffect, useRef } from "react";
import { toAbsoluteApiUrl } from "../lib/env";
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

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
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
  const seekingRef = useRef(false);
  const handlersRef = useRef({
    onError,
    onSeekReady,
    onPositionReaderChange,
  });
  handlersRef.current = {
    onError,
    onSeekReady,
    onPositionReaderChange,
  };
  useEffect(() => {
    if (!video || !settingsReady) return;
    video.volume = Math.min(1, Math.max(0, initialVolume));
    video.muted = initialMuted;
  }, [initialMuted, initialVolume, settingsReady, video]);
  useEffect(() => {
    if (!video) return;
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const engine = new TypeTypeMsePlayer(video, {
      endpoint: toAbsoluteApiUrl(""),
      videoId: config.videoId,
      videoItag: config.videoItag,
      audioItag: config.audioItag,
      audioTrackId: config.audioTrackId,
      startTimeMs: Math.max(0, Math.round(startTime)),
      headers,
    });
    engineRef.current = engine;
    qualityRef.current = { videoItag: config.videoItag };
    const offError = engine.on("error", () => handlersRef.current.onError());
    const volumeChange = () => onVolumeChange?.(video.volume, video.muted);
    const seeking = () => {
      const next = positionMs(video);
      if (!seekingRef.current) runSeek(engine, next, seekingRef, handlersRef.current.onError);
    };
    video.addEventListener("volumechange", volumeChange);
    video.addEventListener("seeking", seeking);
    const unregisterControls = registerSabrVidstackControls(video, {
      play: () => engine.play(),
      pause: () => engine.pause(),
      seek: (seconds) =>
        runSeek(
          engine,
          Math.max(0, Math.round(seconds * 1000)),
          seekingRef,
          handlersRef.current.onError,
        ),
    });
    seekingRef.current = true;
    void engine
      .load()
      .then(() => {
        if (autoplay) void engine.play().catch(() => undefined);
      })
      .catch((error: unknown) => {
        if (!isAbortError(error)) handlersRef.current.onError();
      })
      .finally(() => {
        seekingRef.current = false;
      });
    handlersRef.current.onSeekReady((seconds) =>
      runSeek(
        engine,
        Math.max(0, Math.round(seconds * 1000)),
        seekingRef,
        handlersRef.current.onError,
      ),
    );
    handlersRef.current.onPositionReaderChange(() => positionMs(video));
    return () => {
      offError();
      unregisterControls();
      video.removeEventListener("volumechange", volumeChange);
      video.removeEventListener("seeking", seeking);
      engine.destroy();
      engineRef.current = null;
      handlersRef.current.onPositionReaderChange(null);
    };
  }, [autoplay, config, onVolumeChange, startTime, token, video]);
  useEffect(() => {
    const quality = { videoItag: config.videoItag, audioItag: config.audioItag };
    const previous = qualityRef.current;
    if (!previous || previous.videoItag === quality.videoItag) return;
    qualityRef.current = quality;
    seekingRef.current = true;
    void engineRef.current
      ?.setQuality(quality)
      .catch((error: unknown) => {
        if (!isAbortError(error)) handlersRef.current.onError();
      })
      .finally(() => {
        seekingRef.current = false;
      });
  }, [config.audioItag, config.videoItag]);
  return null;
}
