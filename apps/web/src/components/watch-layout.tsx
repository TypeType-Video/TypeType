import { useEffect, useRef, useState } from "react";
import { useBulletComments } from "../hooks/use-bullet-comments";
import { useMobile } from "../hooks/use-mobile";
import { usePlayerError } from "../hooks/use-player-error";
import { usePlayerErrorResume } from "../hooks/use-player-error-resume";
import { useSaveProgress } from "../hooks/use-progress";
import { useSettings } from "../hooks/use-settings";
import { useVolumeSync } from "../hooks/use-volume-sync";
import { useWatchEndedNavigation } from "../hooks/use-watch-ended-navigation";
import { useWatchVttAssets } from "../hooks/use-watch-layout-assets";
import { useWatchPlayerEvents } from "../hooks/use-watch-player-events";
import { useWatchPlaylist } from "../hooks/use-watch-playlist";
import { useWatchSponsorBlock } from "../hooks/use-watch-sponsorblock";
import { getOriginalAudioLocale } from "../lib/audio-track";
import { detectProvider } from "../lib/provider";
import { useDanmakuStore } from "../stores/danmaku-store";
import { useWatchLayoutStore } from "../stores/watch-layout-store";
import type { VideoStream } from "../types/stream";
import { Toast } from "./toast";
import { getWatchLayoutClasses } from "./watch-layout-classes";
import { WatchPlayerOverlay } from "./watch-player-overlay";
import { WatchSecondaryContent } from "./watch-secondary-content";
import { WatchStage } from "./watch-stage";

type Props = {
  stream: VideoStream;
  startTime: number;
  currentParam: string;
  navigating: boolean;
  list?: string;
  shuffle?: string;
};

export function WatchLayout({ stream, startTime, currentParam, navigating, list, shuffle }: Props) {
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
  const sponsor = useWatchSponsorBlock(stream, settings);
  const relatedStreams = settings.hideRelatedVideos ? [] : (stream.related ?? []);
  const playlist = useWatchPlaylist(list, shuffle, currentParam);
  const { data: bulletComments } = useBulletComments(stream.id, isNicoNico && !hideComments);
  const originalLocale = getOriginalAudioLocale(stream);
  const cinemaMode = useWatchLayoutStore((state) => state.cinemaMode);
  const seekRef = useRef<((seconds: number) => void) | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const handleVolumeChange = useVolumeSync(update.mutate);
  const { thumbnailVtt, chaptersVtt } = useWatchVttAssets(
    stream,
    sponsor.segments,
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

  const autoplay = useWatchEndedNavigation({
    settingsReady,
    autoplay: settings.autoplay,
    hideRelatedVideos: settings.hideRelatedVideos,
    nextParam: playlist.nextParam,
    nextVideo: playlist.nextVideo,
    list,
    shuffle,
    related: stream.related,
  });

  const playerEvents = useWatchPlayerEvents({
    stream,
    isLive,
    mutate: save.mutate,
    onEnded: autoplay.handleEnded,
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
      stream={stream}
      settings={settings}
      qualityFailed={qualityFailed}
      onOriginalLanguageUnavailable={() => setToast("Original audio unavailable")}
      originalAudioLocale={originalLocale}
    />
  );

  const classes = getWatchLayoutClasses(
    cinemaMode,
    Boolean(!isMobile && (playlist.panel || relatedStreams.length > 0)),
  );

  return (
    <div className={classes.containerClass}>
      <WatchStage
        classes={classes}
        stream={stream}
        settings={settings}
        manifestSrc={manifestSrc}
        playerKey={playerKey}
        startTime={retryStartTime > 0 ? retryStartTime : startTime}
        isLive={isLive}
        settingsReady={settingsReady}
        navigating={navigating}
        originalLocale={originalLocale}
        overlay={overlay}
        autoplayState={autoplay.autoplayState}
        sponsorBlockSegments={sponsor.segments}
        autoSkipSegments={sponsor.autoSkipSegments}
        manualSkipSegments={sponsor.manualSkipSegments}
        thumbnailVtt={thumbnailVtt}
        chaptersVtt={chaptersVtt}
        playerFailed={playerFailed}
        cinemaMode={cinemaMode}
        hideComments={hideComments}
        mobilePanel={isMobile ? playlist.panel : null}
        seekRef={seekRef}
        onCaptionStylesChange={(captionStyles) => update.mutate({ captionStyles })}
        onVolumeChange={handleVolumeChange}
        onTimeUpdate={playerEvents.handleTimeUpdate}
        onPause={playerEvents.handlePause}
        onSeeked={playerEvents.handleSeeked}
        onEnded={playerEvents.handleEnded}
        onAutoplayPlayNow={autoplay.playNow}
        onAutoplayCancel={autoplay.cancel}
        onAutoplayPauseToggle={autoplay.togglePause}
        onPreviousVideo={playlist.playPrevious}
        onNextVideo={playlist.playNext}
        onError={handlePlayerError}
        onReset={reset}
      />
      <WatchSecondaryContent
        cinemaMode={cinemaMode}
        stream={stream}
        relatedStreams={relatedStreams}
        showComments={!hideComments}
        playlistPanel={isMobile ? null : playlist.panel}
        onSeekTimestamp={(seconds) => seekRef.current?.(seconds)}
      />
      <Toast message={toast} />
    </div>
  );
}
