import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBulletComments } from "../hooks/use-bullet-comments";
import { usePlayerError } from "../hooks/use-player-error";
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
import { RelatedVideos } from "./related-videos";
import { Toast } from "./toast";
import { VideoPlayer } from "./video-player";
import { WatchMeta } from "./watch-meta";

type Props = {
  stream: VideoStream;
  startTime: number;
};

export function WatchLayout({ stream, startTime }: Props) {
  const navigate = useNavigate();
  const save = useSaveProgress(stream.id);
  const { settings, update, query: settingsQuery } = useSettings();
  const settingsReady =
    (settingsQuery.isSuccess && !settingsQuery.isPlaceholderData) || settingsQuery.isError;
  const isLive = stream.streamType === "live_stream" || stream.streamType === "audio_live_stream";
  const { manifestSrc, playerFailed, qualityFailed, handleError, reset, retryKey } = usePlayerError(
    stream,
    isLive,
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

  const overlay = (
    <>
      {isNicoNico && bulletCommentsOn && bulletComments && (
        <DanmakuOverlay comments={bulletComments} positionRef={playerEvents.positionRef} />
      )}
      <PlayerFocuser />
      <PlayerDefaults
        defaultQuality={qualityFailed ? undefined : settings.defaultQuality}
        defaultAudioLanguage={settings.defaultAudioLanguage || "en"}
        preferOriginalLanguage={settings.preferOriginalLanguage}
        requireOriginalLanguage
        onOriginalLanguageUnavailable={() => {
          setToast("Original audio unavailable, switched to English");
        }}
        originalAudioTrackId={originalTrackId}
        preferredDefaultAudioTrackId={preferredAudioTrackId}
        originalAudioLocale={originalLocale}
        subtitlesEnabled={settings.subtitlesEnabled}
        defaultSubtitleLanguage={settings.defaultSubtitleLanguage || undefined}
      />
    </>
  );

  const relatedStreams = stream.related ?? [];
  const anim = "[animation:page-fade-in_0.2s_ease-out]";
  const containerClass = `flex flex-col gap-6 ${cinemaMode ? "" : "lg:flex-row lg:items-start"} ${anim}`;
  const playerWrapClass = cinemaMode
    ? "overflow-hidden bg-black"
    : "min-w-0 flex-[2] max-w-[133.333vh] flex flex-col gap-4";
  const playerBoxClass = cinemaMode
    ? "mx-auto h-[min(calc(100vw*9/16),82svh)] w-[min(100vw,calc(82svh*16/9))]"
    : "overflow-hidden rounded-lg";

  return (
    <div className={containerClass}>
      <div className={playerWrapClass}>
        <div className={playerBoxClass}>
          <VideoPlayer
            key={`${stream.id}:${retryKey}`}
            src={manifestSrc}
            title={stream.title}
            poster={stream.thumbnail}
            streamType={isLive ? "live" : "on-demand"}
            startTime={startTime}
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
            onError={handleError}
            onEnded={playerEvents.handleEnded}
            onSeekReady={(s) => {
              seekRef.current = s;
            }}
            className={cinemaMode ? "w-full h-full dark [--video-aspect-ratio:16/9]" : undefined}
            mediaClassName={cinemaMode ? "object-cover" : undefined}
          />
          {playerFailed && <PlayerError onRetry={reset} />}
        </div>
        {!cinemaMode && (
          <WatchMeta stream={stream} onSeekTimestamp={(seconds) => seekRef.current?.(seconds)} />
        )}
      </div>
      {!cinemaMode && (
        <div className="w-full lg:flex-1 lg:min-w-64 flex flex-col gap-6">
          <RelatedVideos streams={relatedStreams} />
        </div>
      )}
      {cinemaMode && (
        <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 px-4 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-[2] max-w-[1200px] flex flex-col gap-4">
            <WatchMeta stream={stream} onSeekTimestamp={(seconds) => seekRef.current?.(seconds)} />
          </div>
          <div className="w-full lg:flex-1 lg:min-w-64">
            <RelatedVideos streams={relatedStreams} />
          </div>
        </div>
      )}
      <Toast message={toast} />
    </div>
  );
}
