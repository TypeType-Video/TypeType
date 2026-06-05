import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBulletComments } from "../hooks/use-bullet-comments";
import { usePlayerError } from "../hooks/use-player-error";
import { usePlayerErrorResume } from "../hooks/use-player-error-resume";
import { useSaveProgress } from "../hooks/use-progress";
import { useSettings } from "../hooks/use-settings";
import { useVolumeSync } from "../hooks/use-volume-sync";
import { useWatchVttAssets } from "../hooks/use-watch-layout-assets";
import { useWatchPlayerEvents } from "../hooks/use-watch-player-events";
import {
  getOriginalAudioLocale,
  getOriginalAudioTrackId,
  getPreferredDefaultAudioTrackId,
} from "../lib/audio-track";
import { detectProvider } from "../lib/provider";
import { useDanmakuStore } from "../stores/danmaku-store";
import { useWatchLayoutStore } from "../stores/watch-layout-store";
import type { VideoStream } from "../types/stream";
import { DanmakuOverlay } from "./danmaku-overlay";
import { PlayerDefaults } from "./player-defaults";
import { PlayerError } from "./player-error";
import { PlayerFocuser } from "./player-internals";
import { Toast } from "./toast";
import { VideoPlayer } from "./video-player";
import { WatchMeta } from "./watch-meta";
import { WatchSecondaryContent } from "./watch-secondary-content";

type Props = {
  stream: VideoStream;
  startTime: number;
};

export function WatchLayout({ stream, startTime }: Props) {
  const navigate = useNavigate();
  const save = useSaveProgress(stream.id);
  const { settings, update, settingsReady } = useSettings();
  const isLive = stream.streamType === "live_stream" || stream.streamType === "audio_live_stream";
  const { manifestSrc, playerFailed, qualityFailed, handleError, reset, retryKey } = usePlayerError(
    stream,
    isLive,
    settings.enableHighQualityPlayback,
  );
  const { on: bulletCommentsOn } = useDanmakuStore();
  const isNicoNico = detectProvider(stream.id) === "nicovideo";
  const { data: bulletComments } = useBulletComments(stream.id, isNicoNico);
  const originalTrackId = getOriginalAudioTrackId(stream);
  const preferredAudioTrackId = getPreferredDefaultAudioTrackId(stream);
  const originalLocale = getOriginalAudioLocale(stream);
  const cinemaMode = useWatchLayoutStore((state) => state.cinemaMode);
  const seekRef = useRef<((seconds: number) => void) | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const handleVolumeChange = useVolumeSync(update.mutate);
  const { thumbnailVtt, chaptersVtt } = useWatchVttAssets(stream);
  const playerKey = `${stream.id}:${retryKey}:${settings.enableHighQualityPlayback ? "hq" : "std"}`;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleEnded = useCallback(() => {
    if (!settingsReady || !settings.autoplay) return;
    const next = stream.related?.[0];
    if (!next) return;
    navigate({ to: "/watch", search: { v: next.id } });
  }, [settingsReady, settings.autoplay, stream.related, navigate]);
  const playerEvents = useWatchPlayerEvents({
    stream,
    isLive,
    mutate: save.mutate,
    onEnded: handleEnded,
  });
  const { retryStartTime, handlePlayerError } = usePlayerErrorResume(
    stream.id,
    stream.duration,
    playerEvents.positionRef,
    handleError,
  );

  const overlay = (
    <>
      {isNicoNico && bulletCommentsOn && bulletComments && (
        <DanmakuOverlay comments={bulletComments} positionRef={playerEvents.positionRef} />
      )}
      <PlayerFocuser />
      <PlayerDefaults
        defaultQuality={qualityFailed ? undefined : settings.defaultQuality}
        defaultAudioLanguage={settings.defaultAudioLanguage || undefined}
        preferOriginalLanguage={settings.preferOriginalLanguage}
        requireOriginalLanguage
        onOriginalLanguageUnavailable={() => {
          setToast("Original audio unavailable");
        }}
        originalAudioTrackId={originalTrackId}
        preferredDefaultAudioTrackId={preferredAudioTrackId}
        originalAudioLocale={originalLocale}
        subtitlesEnabled={settings.subtitlesEnabled}
        defaultSubtitleLanguage={settings.defaultSubtitleLanguage || undefined}
      />
    </>
  );

  const anim = "[animation:page-fade-in_0.2s_ease-out]";
  const containerClass = `flex flex-col gap-6 ${cinemaMode ? "" : "lg:flex-row lg:items-start"} ${anim}`;
  const playerWrapClass = cinemaMode
    ? "overflow-hidden bg-black"
    : "min-w-0 flex-[2] max-w-[133.333vh] flex flex-col gap-4";
  const playerBoxClass = cinemaMode
    ? "mx-auto aspect-video w-[min(100%,calc((100svh-4.5rem)*16/9))]"
    : "overflow-hidden rounded-lg";

  return (
    <div className={containerClass}>
      <div className={playerWrapClass}>
        <div className={playerBoxClass}>
          {settingsReady ? (
            <>
              <VideoPlayer
                key={playerKey}
                src={manifestSrc}
                title={stream.title}
                poster={stream.thumbnail}
                streamType={isLive ? "live" : "on-demand"}
                startTime={retryStartTime > 0 ? retryStartTime : startTime}
                subtitles={stream.subtitles}
                sponsorBlockSegments={stream.sponsorBlockSegments}
                thumbnailVtt={thumbnailVtt}
                chaptersVtt={chaptersVtt}
                initialVolume={settings.volume}
                initialMuted={settings.muted}
                settingsReady={settingsReady}
                autoplay={settingsReady}
                originalAudioLocale={originalLocale}
                overlay={overlay}
                onVolumeChange={handleVolumeChange}
                onTimeUpdate={playerEvents.handleTimeUpdate}
                onPause={playerEvents.handlePause}
                onSeeked={playerEvents.handleSeeked}
                onError={handlePlayerError}
                onEnded={playerEvents.handleEnded}
                onSeekReady={(s) => {
                  seekRef.current = s;
                }}
                className={
                  cinemaMode ? "w-full h-full dark [--video-aspect-ratio:16/9]" : undefined
                }
                mediaClassName={cinemaMode ? "object-cover" : undefined}
              />
              {playerFailed && <PlayerError onRetry={reset} />}
            </>
          ) : (
            <div className="aspect-video w-full bg-black" />
          )}
        </div>
        {!cinemaMode && <WatchMeta stream={stream} onSeekTimestamp={(s) => seekRef.current?.(s)} />}
      </div>
      <WatchSecondaryContent
        cinemaMode={cinemaMode}
        stream={stream}
        relatedStreams={stream.related ?? []}
        onSeekTimestamp={(seconds) => seekRef.current?.(seconds)}
      />
      <Toast message={toast} />
    </div>
  );
}
