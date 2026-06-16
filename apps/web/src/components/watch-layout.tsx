import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBulletComments } from "../hooks/use-bullet-comments";
import { useMobile } from "../hooks/use-mobile";
import { usePlayerError } from "../hooks/use-player-error";
import { usePlayerErrorResume } from "../hooks/use-player-error-resume";
import { usePlaylist, usePlaylists } from "../hooks/use-playlists";
import { useSaveProgress } from "../hooks/use-progress";
import { useSettings } from "../hooks/use-settings";
import { useVolumeSync } from "../hooks/use-volume-sync";
import { useWatchVttAssets } from "../hooks/use-watch-layout-assets";
import { useWatchPlayerEvents } from "../hooks/use-watch-player-events";
import { useWatchSponsorBlock } from "../hooks/use-watch-sponsorblock";
import {
  getOriginalAudioLocale,
  getOriginalAudioTrackId,
  getPreferredDefaultAudioTrackId,
} from "../lib/audio-track";
import { detectProvider } from "../lib/provider";
import { toPublicWatchParam } from "../lib/watch-url";
import { useDanmakuStore } from "../stores/danmaku-store";
import { useWatchLayoutStore } from "../stores/watch-layout-store";
import type { VideoStream } from "../types/stream";
import { PlayerError } from "./player-error";
import { Toast } from "./toast";
import { VideoPlayer } from "./video-player";
import { getWatchLayoutClasses } from "./watch-layout-classes";
import { WatchMeta } from "./watch-meta";
import { WatchPlayerOverlay } from "./watch-player-overlay";
import { WatchPlaylistPanel } from "./watch-playlist-panel";
import { WatchSecondaryContent } from "./watch-secondary-content";

type Props = {
  stream: VideoStream;
  startTime: number;
  list?: string;
  shuffle?: boolean;
};

export function WatchLayout({ stream, startTime, list, shuffle }: Props) {
  const navigate = useNavigate();
  const isMobile = useMobile();
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
  const hideComments = settings.hideComments;
  const {
    segments: sponsorBlockSegments,
    autoSkipSegments,
    manualSkipSegments,
  } = useWatchSponsorBlock(stream, settings);
  const relatedStreams = settings.hideRelatedVideos ? [] : (stream.related ?? []);
  const playlist = usePlaylist(list ?? "");
  const { reorder: playlistReorder } = usePlaylists();
  const playlistVideos = playlist.data?.videos ?? [];
  const currentParam = toPublicWatchParam(stream.id);
  const inPlaylist = Boolean(list) && playlistVideos.length > 0;
  const currentIdx = inPlaylist
    ? playlistVideos.findIndex((video) => toPublicWatchParam(video.url) === currentParam)
    : -1;
  const { data: bulletComments } = useBulletComments(stream.id, isNicoNico && !hideComments);
  const originalTrackId = getOriginalAudioTrackId(stream);
  const preferredAudioTrackId = getPreferredDefaultAudioTrackId(stream);
  const originalLocale = getOriginalAudioLocale(stream);
  const cinemaMode = useWatchLayoutStore((state) => state.cinemaMode);
  const seekRef = useRef<((seconds: number) => void) | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const handleVolumeChange = useVolumeSync(update.mutate);
  const { thumbnailVtt, chaptersVtt } = useWatchVttAssets(
    stream,
    sponsorBlockSegments,
    settings.sponsorBlockShowChapters,
  );
  const playerKey = [
    stream.id,
    retryKey,
    settings.enableHighQualityPlayback ? "hq" : "std",
    thumbnailVtt ? "thumbs" : "no-thumbs",
    chaptersVtt ? "chapters" : "no-chapters",
  ].join(":");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleEnded = useCallback(() => {
    if (!settingsReady || !settings.autoplay) return;
    if (inPlaylist && currentIdx >= 0) {
      const others = playlistVideos.filter((_, index) => index !== currentIdx);
      const nextVideo = shuffle
        ? others[Math.floor(Math.random() * others.length)]
        : playlistVideos[currentIdx + 1];
      if (nextVideo) {
        navigate({
          to: "/watch",
          search: {
            v: toPublicWatchParam(nextVideo.url),
            list,
            ...(shuffle ? { shuffle: true } : {}),
          },
        });
        return;
      }
    }
    const next = stream.related?.[0];
    if (!next) return;
    navigate({ to: "/watch", search: { v: next.id } });
  }, [
    settingsReady,
    settings.autoplay,
    inPlaylist,
    currentIdx,
    playlistVideos,
    shuffle,
    list,
    stream.related,
    navigate,
  ]);
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
    <WatchPlayerOverlay
      isNicoNico={isNicoNico}
      hideComments={hideComments}
      bulletCommentsOn={bulletCommentsOn}
      bulletComments={bulletComments}
      positionRef={playerEvents.positionRef}
      settings={settings}
      qualityFailed={qualityFailed}
      onOriginalLanguageUnavailable={() => setToast("Original audio unavailable")}
      originalAudioTrackId={originalTrackId}
      preferredDefaultAudioTrackId={preferredAudioTrackId}
      originalAudioLocale={originalLocale}
    />
  );

  const { containerClass, playerWrapClass, playerBoxClass, playerClassName, mediaClassName } =
    getWatchLayoutClasses(cinemaMode);

  const playlistPanel =
    inPlaylist && playlist.data && list ? (
      <WatchPlaylistPanel
        playlist={playlist.data}
        listId={list}
        currentParam={currentParam}
        shuffle={Boolean(shuffle)}
        onToggleShuffle={() =>
          navigate({
            to: "/watch",
            search: { v: currentParam, list, ...(shuffle ? {} : { shuffle: true }) },
            resetScroll: false,
          })
        }
        onReorder={(order) => playlistReorder.mutate({ id: list, order })}
      />
    ) : null;

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
                sponsorBlockSegments={sponsorBlockSegments}
                autoSkipSponsorBlock={Boolean(autoSkipSegments)}
                autoSkipSponsorBlockSegments={autoSkipSegments}
                manualSkipSponsorBlockSegments={manualSkipSegments}
                muteSponsorBlockInsteadOfSkip={settings.sponsorBlockMuteInsteadOfSkip}
                showCurrentSponsorBlockSegment={settings.sponsorBlockShowCurrentSegment}
                thumbnailVtt={thumbnailVtt}
                chaptersVtt={chaptersVtt}
                initialVolume={settings.volume}
                initialMuted={settings.muted}
                settingsReady={settingsReady}
                autoplay={settingsReady}
                originalAudioLocale={originalLocale}
                overlay={overlay}
                captionStyles={settings.captionStyles}
                onCaptionStylesChange={(captionStyles) => update.mutate({ captionStyles })}
                onVolumeChange={handleVolumeChange}
                onTimeUpdate={playerEvents.handleTimeUpdate}
                onPause={playerEvents.handlePause}
                onSeeked={playerEvents.handleSeeked}
                onError={handlePlayerError}
                onEnded={playerEvents.handleEnded}
                onSeekReady={(s) => (seekRef.current = s)}
                className={playerClassName}
                mediaClassName={mediaClassName}
              />
              {playerFailed && <PlayerError onRetry={reset} />}
            </>
          ) : (
            <div className="aspect-video w-full bg-black" />
          )}
        </div>
        {isMobile && playlistPanel ? <div className="mt-4">{playlistPanel}</div> : null}
        {!cinemaMode && (
          <WatchMeta
            stream={stream}
            showComments={!hideComments}
            onSeekTimestamp={(s) => seekRef.current?.(s)}
          />
        )}
      </div>
      <WatchSecondaryContent
        cinemaMode={cinemaMode}
        stream={stream}
        relatedStreams={relatedStreams}
        showComments={!hideComments}
        playlistPanel={isMobile ? null : playlistPanel}
        onSeekTimestamp={(seconds) => seekRef.current?.(seconds)}
      />
      <Toast message={toast} />
    </div>
  );
}
