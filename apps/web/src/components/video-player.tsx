import { useMemo } from "react";
import { useSabrPlayerState } from "../hooks/use-sabr-player-state";
import { isIosDevice } from "../lib/ios-device";
import { mediaSourceViewType } from "../lib/media-source-view-type";
import { SABR_VIDEO_PROVIDER_LOADERS, sabrMediaSrc } from "../lib/sabr-vidstack-loader";
import { MediaPlayer, MediaProvider } from "../lib/vidstack";
import { patchVidstackProviderLoaders } from "../lib/vidstack-provider-loader-patch";
import { AudioCenterToggle } from "./audio-center-toggle";
import { AudioOnlyPoster } from "./audio-only-poster";
import { CaptionStyleRestorer } from "./caption-style-restorer";
import { FragmentBoundarySeeker } from "./fragment-boundary-seeker";
import { MediaProgressEvents } from "./media-progress-events";
import { MediaSessionSync } from "./media-session-sync";
import { SeekBridge } from "./player-internals";
import { PlayerSeeker } from "./player-seeker";
import { SabrMsePlayer } from "./sabr-mse-player";
import { videoPlayerClassName } from "./video-player-class";
import { useVideoPlayerEvents } from "./video-player-events";
import { VideoPlayerLayout } from "./video-player-layout";
import { VideoPlayerPlaybackTools } from "./video-player-playback-tools";
import { VideoPlayerTracks } from "./video-player-tracks";
import type { VideoPlayerProps } from "./video-player-types";
import { VolumeRestorer } from "./volume-restorer";

patchVidstackProviderLoaders();

export function VideoPlayer({
  src,
  sabrConfig,
  title,
  poster,
  streamType = "on-demand",
  startTime = 0,
  seekIntervalSeconds,
  subtitles,
  sponsorBlockSegments,
  autoSkipSponsorBlockSegments,
  manualSkipSponsorBlockSegments,
  autoSkipSponsorBlock = true,
  muteSponsorBlockInsteadOfSkip = false,
  showCurrentSponsorBlockSegment = false,
  thumbnailVtt,
  chaptersVtt,
  initialVolume = 1,
  initialMuted = false,
  settingsReady = false,
  autoplay = false,
  audioOnly = false,
  originalAudioLocale,
  overlay,
  captionStyles,
  onCaptionStylesChange,
  onVolumeChange,
  onTimeUpdate,
  onPlay,
  onPause,
  onSeeking,
  onSeeked,
  onError,
  onSeekReady,
  onPositionReaderChange,
  onEnded,
  onPreviousVideo,
  onNextVideo,
  className,
  mediaClassName,
}: VideoPlayerProps) {
  const ios = isIosDevice();
  const playerClassName = videoPlayerClassName(audioOnly, className);
  const sabrVideoId = sabrConfig?.videoId;
  const sabrSrc = useMemo(() => (sabrVideoId ? sabrMediaSrc(sabrVideoId) : null), [sabrVideoId]);
  const activeSrc = sabrSrc ?? src;
  const viewType = mediaSourceViewType(audioOnly, Boolean(sabrConfig), activeSrc);
  const { handleProviderChange, handleError, handleEnded } = useVideoPlayerEvents({
    src: activeSrc,
    onError,
    onEnded,
  });

  const sabrState = useSabrPlayerState(Boolean(sabrConfig), handleProviderChange);

  return (
    <MediaPlayer
      className={playerClassName}
      src={activeSrc}
      viewType={viewType}
      streamType={streamType}
      logLevel="warn"
      crossOrigin
      playsInline
      hideControlsOnMouseLeave
      {...(ios ? { "webkit-playsinline": "true" } : {})}
      autoPlay={sabrConfig ? false : autoplay}
      storage={null}
      title={title}
      poster={poster}
      onProviderChange={sabrState.handleProviderChange}
      onError={handleError}
      aria-busy={sabrState.seeking}
      data-sabr-seeking={sabrState.seeking ? "true" : undefined}
    >
      <MediaProvider
        loaders={sabrConfig ? SABR_VIDEO_PROVIDER_LOADERS : undefined}
        className={mediaClassName ?? "h-full w-full"}
        mediaProps={mediaClassName ? { className: mediaClassName } : undefined}
      >
        {!audioOnly && <VideoPlayerTracks subtitles={subtitles} chaptersVtt={chaptersVtt} />}
      </MediaProvider>
      {sabrConfig && (
        <SabrMsePlayer
          config={sabrConfig}
          video={sabrState.video}
          startTime={startTime}
          autoplay={autoplay}
          initialVolume={initialVolume}
          initialMuted={initialMuted}
          settingsReady={settingsReady}
          onVolumeChange={onVolumeChange}
          onError={onError ?? (() => undefined)}
          onSeekStateChange={sabrState.setSeeking}
          onSeekReady={onSeekReady ?? (() => undefined)}
          onPositionReaderChange={onPositionReaderChange ?? (() => undefined)}
        />
      )}
      {audioOnly && <AudioOnlyPoster poster={poster} title={title} media={sabrState.media} />}
      {audioOnly && <AudioCenterToggle video={sabrState.video} />}
      <MediaProgressEvents
        suppressPlaybackEvents={sabrState.seeking}
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onSeeking={onSeeking}
        onSeeked={onSeeked}
        onEnded={handleEnded}
        onPositionReaderChange={onPositionReaderChange}
      />
      {overlay}
      <VideoPlayerLayout
        audioOnly={audioOnly}
        audioUsesVideoProvider={audioOnly && viewType === "video"}
        sabr={Boolean(sabrConfig)}
        sabrVideo={sabrState.video}
        seeking={sabrState.seeking}
        thumbnailVtt={thumbnailVtt}
        originalAudioLocale={originalAudioLocale}
        onPreviousVideo={onPreviousVideo}
        onNextVideo={onNextVideo}
      />
      {!sabrConfig && <PlayerSeeker startTime={startTime} />}
      {!sabrConfig && <FragmentBoundarySeeker intervalSeconds={seekIntervalSeconds} />}
      <VolumeRestorer
        initialVolume={initialVolume}
        initialMuted={initialMuted}
        settingsReady={settingsReady}
        onVolumeChange={onVolumeChange}
      />
      {captionStyles && onCaptionStylesChange && (
        <CaptionStyleRestorer
          captionStyles={captionStyles}
          settingsReady={settingsReady}
          onChange={onCaptionStylesChange}
        />
      )}
      <MediaSessionSync
        title={title}
        artwork={poster}
        canSeek={streamType !== "live"}
        isLive={streamType === "live"}
        onPreviousTrack={onPreviousVideo}
        onNextTrack={onNextVideo}
      />
      <VideoPlayerPlaybackTools
        canSeek={streamType !== "live"}
        audioOnly={audioOnly}
        segments={sponsorBlockSegments}
        autoSkipSegments={autoSkipSponsorBlockSegments}
        manualSkipSegments={manualSkipSponsorBlockSegments}
        autoSkip={autoSkipSponsorBlock}
        mutedSkip={muteSponsorBlockInsteadOfSkip}
        showCurrent={showCurrentSponsorBlockSegment}
      />
      {onSeekReady && <SeekBridge onSeekReady={onSeekReady} />}
    </MediaPlayer>
  );
}
