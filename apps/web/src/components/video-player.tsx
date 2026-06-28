import { isIosDevice } from "../lib/ios-device";
import { MediaPlayer, MediaProvider, Track } from "../lib/vidstack";
import { patchVidstackProviderLoaders } from "../lib/vidstack-provider-loader-patch";
import { AudioOnlyPoster } from "./audio-only-poster";
import { CaptionStyleRestorer } from "./caption-style-restorer";
import { MediaProgressEvents } from "./media-progress-events";
import { MediaSessionSync } from "./media-session-sync";
import { PlaybackReturnGuard } from "./playback-return-guard";
import { PlayerHotkeys } from "./player-hotkeys";
import { PlayerSeeker, SeekBridge, SponsorBlockSkipper } from "./player-internals";
import { PlayerPlayPauseIndicator } from "./player-play-pause-indicator";
import { SponsorBlockBar } from "./sponsorblock-bar";
import { SponsorBlockCurrentSegment } from "./sponsorblock-current-segment";
import { buildSafeSubtitleTracks } from "./subtitle-track-utils";
import { ChaptersTrack } from "./video-player-core";
import { useVideoPlayerEvents } from "./video-player-events";
import { VideoPlayerLayout } from "./video-player-layout";
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
  onPause,
  onSeeked,
  onError,
  onSeekReady,
  onEnded,
  onPreviousVideo,
  onNextVideo,
  className,
  mediaClassName,
}: VideoPlayerProps) {
  const ios = isIosDevice();
  const subtitleTracks = buildSafeSubtitleTracks(subtitles);
  const mediaProps = mediaClassName ? { className: mediaClassName } : undefined;
  const playerClassName = [
    "w-full h-full dark",
    audioOnly ? "typetype-audio-only-player" : null,
    className,
  ]
    .filter(Boolean)
    .join(" ");
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
      <MediaProvider className={mediaClassName ?? "h-full w-full"} mediaProps={mediaProps}>
        {!audioOnly &&
          subtitleTracks.map((s) => (
            <Track
              key={s.key}
              id={s.id}
              kind="subtitles"
              src={s.src}
              label={s.label}
              lang={s.lang}
              type="vtt"
            />
          ))}
        {!audioOnly && chaptersVtt && <ChaptersTrack src={chaptersVtt} />}
      </MediaProvider>
      {audioOnly && <AudioOnlyPoster poster={poster} title={title} />}
      <MediaProgressEvents
        onTimeUpdate={onTimeUpdate}
        onPause={onPause}
        onSeeked={onSeeked}
        onEnded={handleEnded}
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
      <PlaybackReturnGuard />
      <VolumeRestorer
        initialVolume={initialVolume}
        initialMuted={initialMuted}
        settingsReady={settingsReady}
        autoplay={autoplay}
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
      <PlayerPlayPauseIndicator />
      {autoSkipSponsorBlock && autoSkipSponsorBlockSegments && (
        <SponsorBlockSkipper
          segments={autoSkipSponsorBlockSegments}
          muteInsteadOfSkip={muteSponsorBlockInsteadOfSkip}
        />
      )}
      {sponsorBlockSegments && <SponsorBlockBar segments={sponsorBlockSegments} />}
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
