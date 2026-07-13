import { useRef } from "react";
import { useBulletComments } from "../hooks/use-bullet-comments";
import { useDeArrowBranding } from "../hooks/use-dearrow";
import { useMobile } from "../hooks/use-mobile";
import { usePlayerError } from "../hooks/use-player-error";
import { usePlayerErrorResume } from "../hooks/use-player-error-resume";
import { useSaveProgress } from "../hooks/use-progress";
import { useSabrPlaybackConfig } from "../hooks/use-sabr-playback-config";
import { useSettings } from "../hooks/use-settings";
import { useVolumeSync } from "../hooks/use-volume-sync";
import { useWatchAudioOnlyPlayback } from "../hooks/use-watch-audio-only-playback";
import { useWatchVttAssets } from "../hooks/use-watch-layout-assets";
import { useWatchPlaybackFlow } from "../hooks/use-watch-playback-flow";
import { useWatchPlayerSourceState } from "../hooks/use-watch-player-source-state";
import { useWatchPlaylist } from "../hooks/use-watch-playlist";
import { useWatchSponsorBlock } from "../hooks/use-watch-sponsorblock";
import { useWatchToast } from "../hooks/use-watch-toast";
import { getOriginalAudioLocale } from "../lib/audio-track";
import { detectProvider } from "../lib/provider";
import { useDanmakuStore } from "../stores/danmaku-store";
import { useWatchLayoutStore } from "../stores/watch-layout-store";
import { Toast } from "./toast";
import { getWatchLayoutClasses } from "./watch-layout-classes";
import { WatchLayoutPlayerOverlay } from "./watch-layout-player-overlay";
import type { WatchLayoutProps } from "./watch-layout-types";
import { WatchSecondaryContent } from "./watch-secondary-content";
import { WatchStage } from "./watch-stage";
export function WatchLayout({
  stream,
  startTime,
  currentParam,
  navigating,
  list,
  shuffle,
}: WatchLayoutProps) {
  const isMobile = useMobile();
  const save = useSaveProgress(stream.id);
  const { settings, update, settingsReady } = useSettings();
  const branding = useDeArrowBranding(stream.id, stream.title, stream.thumbnail, stream.duration);
  const displayStream = { ...stream, ...branding };
  const isLive = stream.streamType === "live_stream" || stream.streamType === "audio_live_stream";
  const player = usePlayerError(stream, isLive, settings.enableHighQualityPlayback);
  const { on: bulletCommentsOn } = useDanmakuStore();
  const isNicoNico = detectProvider(stream.id) === "nicovideo";
  const sponsor = useWatchSponsorBlock(stream, settings);
  const relatedStreams = settings.hideRelatedVideos ? [] : (stream.related ?? []);
  const playlist = useWatchPlaylist(list, shuffle, currentParam);
  const { data: bulletComments } = useBulletComments(
    stream.id,
    isNicoNico && !settings.hideComments,
  );
  const cinemaMode = useWatchLayoutStore((state) => state.cinemaMode);
  const seekRef = useRef<((seconds: number) => void) | null>(null);
  const positionReaderRef = useRef<(() => number | null) | null>(null);
  const handleVolumeChange = useVolumeSync(update.mutate);
  const { thumbnailVtt, chaptersVtt } = useWatchVttAssets(
    stream,
    sponsor.segments,
    settings.sponsorBlockShowChapters,
  );
  const { autoplay, playerEvents } = useWatchPlaybackFlow({
    stream,
    settings,
    settingsReady,
    isLive,
    nextParam: playlist.nextParam,
    nextVideo: playlist.nextVideo,
    list,
    shuffle,
    mutate: (position, keepalive) => save.mutate({ position, keepalive }),
    onPlay: player.clearFailed,
  });
  const audioOnly = useWatchAudioOnlyPlayback({
    currentParam,
    settings,
    settingsReady,
    isLive,
    positionRef: playerEvents.positionRef,
    readPositionMs: () => positionReaderRef.current?.() ?? null,
    clearFailed: player.clearFailed,
    sabrEnabled: player.sabrEnabled,
  });
  const sabrConfig = useSabrPlaybackConfig(
    stream,
    player.sabrEnabled,
    settings.defaultQuality,
    settings.defaultAudioLanguage,
    audioOnly.active,
  );
  const { toast, setToast } = useWatchToast(audioOnly.unavailable);
  const { retryStartTime, handlePlayerError } = usePlayerErrorResume(
    stream.id,
    stream.duration,
    playerEvents.positionRef,
    player.handleError,
  );
  const sourceState = useWatchPlayerSourceState({
    streamId: stream.id,
    retryKey: player.retryKey,
    startTime: retryStartTime > 0 ? retryStartTime : (audioOnly.switchPositionMs ?? startTime),
    manifestSrc: audioOnly.src ?? player.manifestSrc,
    positionRef: playerEvents.positionRef,
    highQuality: settings.enableHighQualityPlayback,
    hasThumbnails: Boolean(thumbnailVtt),
    hasChapters: Boolean(chaptersVtt),
    audioOnlyEnabled: audioOnly.enabled,
    audioOnlyLoading: audioOnly.loading,
    hasAudioOnlySource: Boolean(audioOnly.src),
    sabrEnabled: player.sabrEnabled,
    settingsReady,
    autoplayEnabled: settings.autoplay,
    navigating,
    playbackIntent: playerEvents.playbackIntent,
  });
  const classes = getWatchLayoutClasses(
    cinemaMode,
    Boolean(!isMobile && (playlist.panel || relatedStreams.length > 0)),
  );
  return (
    <div className={classes.containerClass}>
      <WatchStage
        classes={classes}
        stream={displayStream}
        settings={settings}
        manifestSrc={audioOnly.src ?? player.manifestSrc}
        sabrConfig={sabrConfig}
        audioOnly={audioOnly.active}
        playerKey={sourceState.playerKey}
        startTime={player.seekStartTime ?? sourceState.startTime}
        seekIntervalSeconds={isNicoNico ? 6 : undefined}
        isLive={isLive}
        settingsReady={settingsReady}
        autoplay={sourceState.autoplay}
        navigating={navigating || sourceState.waitForInitialAudioSource || player.manifestLoading}
        originalLocale={getOriginalAudioLocale(stream)}
        overlay={
          <WatchLayoutPlayerOverlay
            isNicoNico={isNicoNico}
            hideComments={settings.hideComments}
            bulletCommentsOn={bulletCommentsOn}
            bulletComments={bulletComments}
            positionRef={playerEvents.positionRef}
            stream={stream}
            settings={settings}
            qualityFailed={player.qualityFailed}
            onOriginalLanguageUnavailable={() => setToast("Original audio unavailable")}
          />
        }
        autoplayState={autoplay.autoplayState}
        sponsorBlockSegments={sponsor.segments}
        autoSkipSegments={sponsor.autoSkipSegments}
        manualSkipSegments={sponsor.manualSkipSegments}
        thumbnailVtt={thumbnailVtt}
        chaptersVtt={chaptersVtt}
        playerFailed={player.playerFailed}
        cinemaMode={cinemaMode}
        hideComments={settings.hideComments}
        mobilePanel={isMobile ? playlist.panel : null}
        seekRef={seekRef}
        audioOnlyControls={audioOnly.controls}
        onCaptionStylesChange={(captionStyles) => update.mutate({ captionStyles })}
        onVolumeChange={handleVolumeChange}
        onTimeUpdate={playerEvents.handleTimeUpdate}
        onPlay={playerEvents.handlePlay}
        onPause={playerEvents.handlePause}
        onSeeking={audioOnly.active ? () => undefined : player.handleSeeking}
        onSeeked={playerEvents.handleSeeked}
        onEnded={playerEvents.handleEnded}
        onAutoplayPlayNow={autoplay.playNow}
        onAutoplayCancel={autoplay.cancel}
        onAutoplayPauseToggle={autoplay.togglePause}
        onPositionReaderChange={(reader) => (positionReaderRef.current = reader)}
        onPreviousVideo={playlist.playPrevious}
        onNextVideo={playlist.playNext}
        onError={() =>
          audioOnly.fail() ? setToast("Audio only unavailable") : handlePlayerError()
        }
        onReset={player.reset}
      />
      <WatchSecondaryContent
        cinemaMode={cinemaMode}
        stream={displayStream}
        relatedStreams={relatedStreams}
        showComments={!settings.hideComments}
        playlistPanel={isMobile ? null : playlist.panel}
        onSeekTimestamp={(seconds) => seekRef.current?.(seconds)}
        audioOnly={audioOnly.controls}
      />
      <Toast message={toast} />
    </div>
  );
}
