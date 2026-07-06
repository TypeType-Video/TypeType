import { isIosDevice } from "../lib/ios-device";
import { MediaPlayer, MediaProvider } from "../lib/vidstack";
import { patchVidstackProviderLoaders } from "../lib/vidstack-provider-loader-patch";
import { AudioCenterToggle } from "./audio-center-toggle";
import { AudioOnlyPoster } from "./audio-only-poster";
import { CaptionStyleRestorer } from "./caption-style-restorer";
import { MediaProgressEvents } from "./media-progress-events";
import { MediaSessionSync } from "./media-session-sync";
import { PlayerHotkeys } from "./player-hotkeys";
import { SeekBridge, SponsorBlockSkipper } from "./player-internals";
import { PlayerPlayPauseIndicator } from "./player-play-pause-indicator";
import { PlayerSeeker } from "./player-seeker";
import { SponsorBlockBar } from "./sponsorblock-bar";
import { SponsorBlockCurrentSegment } from "./sponsorblock-current-segment";
import { SponsorBlockSkipNotice } from "./sponsorblock-skip-notice";
import { videoPlayerClassName } from "./video-player-class";
import { useVideoPlayerEvents } from "./video-player-events";
import { VideoPlayerLayout } from "./video-player-layout";
import { VideoPlayerTracks } from "./video-player-tracks";
import type { VideoPlayerProps } from "./video-player-types";
import { VolumeRestorer } from "./volume-restorer";

patchVidstackProviderLoaders();

export function VideoPlayer({
  src,
  title,
  poster,
  streamType = "on-demand",
  startTime = 0,
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
  const { handleProviderChange, handleError, handleEnded } = useVideoPlayerEvents({
    src,
    onError,
    onEnded,
  });

  return (
    <MediaPlayer
      className={playerClassName}
      src={src}
      viewType={audioOnly ? "audio" : "video"}
      streamType={streamType}
      logLevel="warn"
      crossOrigin
      playsInline
      hideControlsOnMouseLeave
      {...(ios ? { "webkit-playsinline": "true" } : {})}
      autoPlay={autoplay}
      storage={null}
      title={title}
      poster={poster}
      onProviderChange={handleProviderChange}
      onError={handleError}
    >
      <MediaProvider
        className={mediaClassName ?? "h-full w-full"}
        mediaProps={mediaClassName ? { className: mediaClassName } : undefined}
      >
        {!audioOnly && <VideoPlayerTracks subtitles={subtitles} chaptersVtt={chaptersVtt} />}
      </MediaProvider>
      {audioOnly && <AudioOnlyPoster poster={poster} title={title} />}
      {audioOnly && <AudioCenterToggle />}
      <MediaProgressEvents
        onTimeUpdate={onTimeUpdate}
        onPlay={onPlay}
        onPause={onPause}
        onSeeked={onSeeked}
        onEnded={handleEnded}
        onPositionReaderChange={onPositionReaderChange}
      />
      {overlay}
      <VideoPlayerLayout
        audioOnly={audioOnly}
        thumbnailVtt={thumbnailVtt}
        originalAudioLocale={originalAudioLocale}
        onPreviousVideo={onPreviousVideo}
        onNextVideo={onNextVideo}
      />
      <PlayerSeeker startTime={startTime} />
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
      <PlayerHotkeys canSeek={streamType !== "live"} />
      {!audioOnly && <PlayerPlayPauseIndicator />}
      {!audioOnly && autoSkipSponsorBlock && autoSkipSponsorBlockSegments && (
        <SponsorBlockSkipper
          segments={autoSkipSponsorBlockSegments}
          muteInsteadOfSkip={muteSponsorBlockInsteadOfSkip}
        />
      )}
      {sponsorBlockSegments && <SponsorBlockBar segments={sponsorBlockSegments} />}
      {sponsorBlockSegments && <SponsorBlockSkipNotice />}
      {showCurrentSponsorBlockSegment && sponsorBlockSegments && (
        <SponsorBlockCurrentSegment
          segments={sponsorBlockSegments}
          autoSkipSegments={autoSkipSponsorBlockSegments}
          manualSkipSegments={manualSkipSponsorBlockSegments}
          muteInsteadOfSkip={muteSponsorBlockInsteadOfSkip}
        />
      )}
      {onSeekReady && <SeekBridge onSeekReady={onSeekReady} />}
    </MediaPlayer>
  );
}
