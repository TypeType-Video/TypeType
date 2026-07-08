import { TypeTypeMsePlayer, type TypeTypeMseQuality } from "@typetype/mse";
import { useEffect, useRef } from "react";
import { toAbsoluteApiUrl } from "../lib/env";
import type { SabrPlaybackConfig } from "../lib/sabr-source";
import { useAuthStore } from "../stores/auth-store";

type Props = {
  config: SabrPlaybackConfig;
  title: string;
  poster?: string;
  startTime: number;
  autoplay: boolean;
  initialVolume: number;
  initialMuted: boolean;
  settingsReady: boolean;
  className?: string;
  mediaClassName?: string;
  onVolumeChange?: (volume: number, muted: boolean) => void;
  onTimeUpdate: (positionMs: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onSeeking: (positionMs: number) => void;
  onSeeked: () => void;
  onEnded: () => void;
  onError: () => void;
  onSeekReady: (seek: (seconds: number) => void) => void;
  onPositionReaderChange: (reader: (() => number | null) | null) => void;
};

function positionMs(video: HTMLVideoElement): number {
  return Math.max(0, Math.round(video.currentTime * 1000));
}

function runSeek(player: TypeTypeMsePlayer | null, position: number, flag: { current: boolean }) {
  flag.current = true;
  void player?.seek(position).finally(() => {
    flag.current = false;
  });
}

export function SabrMsePlayer({
  config,
  title,
  poster,
  startTime,
  autoplay,
  initialVolume,
  initialMuted,
  settingsReady,
  className,
  mediaClassName,
  onVolumeChange,
  onTimeUpdate,
  onPlay,
  onPause,
  onSeeking,
  onSeeked,
  onEnded,
  onError,
  onSeekReady,
  onPositionReaderChange,
}: Props) {
  const token = useAuthStore((state) => state.token);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const engineRef = useRef<TypeTypeMsePlayer | null>(null);
  const qualityRef = useRef<TypeTypeMseQuality | null>(null);
  const seekingRef = useRef(false);
  const handlersRef = useRef({
    onTimeUpdate,
    onPlay,
    onPause,
    onSeeking,
    onSeeked,
    onEnded,
    onError,
    onSeekReady,
    onPositionReaderChange,
  });
  handlersRef.current = {
    onTimeUpdate,
    onPlay,
    onPause,
    onSeeking,
    onSeeked,
    onEnded,
    onError,
    onSeekReady,
    onPositionReaderChange,
  };
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !settingsReady) return;
    video.volume = Math.min(1, Math.max(0, initialVolume));
    video.muted = initialMuted;
  }, [initialMuted, initialVolume, settingsReady]);
  useEffect(() => {
    const video = videoRef.current;
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
    void engine.load().then(() => {
      if (autoplay) void engine.play().catch(() => undefined);
    });
    handlersRef.current.onSeekReady((seconds) =>
      runSeek(engine, Math.max(0, Math.round(seconds * 1000)), seekingRef),
    );
    handlersRef.current.onPositionReaderChange(() =>
      videoRef.current ? positionMs(videoRef.current) : null,
    );
    return () => {
      offError();
      engine.destroy();
      engineRef.current = null;
      handlersRef.current.onPositionReaderChange(null);
    };
  }, [autoplay, config, startTime, token]);
  useEffect(() => {
    const quality = { videoItag: config.videoItag, audioItag: config.audioItag };
    const previous = qualityRef.current;
    if (!previous || previous.videoItag === quality.videoItag) return;
    qualityRef.current = quality;
    seekingRef.current = true;
    void engineRef.current?.setQuality(quality).finally(() => {
      seekingRef.current = false;
    });
  }, [config.audioItag, config.videoItag]);
  return (
    <div className={`relative h-full w-full bg-black ${className ?? ""}`.trim()}>
      <video
        ref={videoRef}
        className={mediaClassName ?? "h-full w-full"}
        title={title}
        poster={poster}
        controls
        playsInline
        onTimeUpdate={(event) => handlersRef.current.onTimeUpdate(positionMs(event.currentTarget))}
        onPlay={() => handlersRef.current.onPlay()}
        onPause={() => handlersRef.current.onPause()}
        onVolumeChange={(event) =>
          onVolumeChange?.(event.currentTarget.volume, event.currentTarget.muted)
        }
        onSeeking={(event) => {
          const next = positionMs(event.currentTarget);
          handlersRef.current.onSeeking(next);
          if (!seekingRef.current) runSeek(engineRef.current, next, seekingRef);
        }}
        onSeeked={() => handlersRef.current.onSeeked()}
        onEnded={() => handlersRef.current.onEnded()}
        onError={() => handlersRef.current.onError()}
      >
        <track kind="captions" />
      </video>
    </div>
  );
}
