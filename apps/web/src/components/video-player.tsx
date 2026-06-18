import { isIosDevice } from "../lib/ios-device";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
  MediaPlayer,
  MediaProvider,
  Track,
} from "../lib/vidstack";
import { AudioTrackSelector } from "./audio-track-selector";
import { CaptionStyleRestorer } from "./caption-style-restorer";
import { FormatSelector } from "./format-selector";
import { MediaProgressEvents } from "./media-progress-events";
import { MediaSessionSync } from "./media-session-sync";
import { PlayerHotkeys } from "./player-hotkeys";
import { PlayerSeeker, SeekBridge, SponsorBlockSkipper } from "./player-internals";
import { PlayerPlayPauseIndicator } from "./player-play-pause-indicator";
import { QualitySelector } from "./quality-selector";
import { SponsorBlockBar } from "./sponsorblock-bar";
import { SponsorBlockCurrentSegment } from "./sponsorblock-current-segment";
import { buildSafeSubtitleTracks } from "./subtitle-track-utils";
import { ChaptersTrack } from "./video-player-core";
import { useVideoPlayerEvents } from "./video-player-events";
import { VideoPlayerLayoutControls } from "./video-player-layout-controls";
import type { VideoPlayerProps } from "./video-player-types";
import { VolumeRestorer } from "./volume-restorer";

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
  className,
  mediaClassName,
}: VideoPlayerProps) {
  const ios = isIosDevice();
  const subtitleTracks = buildSafeSubtitleTracks(subtitles);
  const mediaProps = mediaClassName ? { className: mediaClassName } : undefined;
  const { handleProviderChange, handleError, handleEnded } = useVideoPlayerEvents({
    src,
    onError,
    onEnded,
  });

  return (
    <MediaPlayer
      className={className ? `w-full h-full dark ${className}` : "w-full h-full dark"}
      src={src}
      viewType="video"
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
        {subtitleTracks.map((s) => (
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
        {chaptersVtt && <ChaptersTrack src={chaptersVtt} />}
      </MediaProvider>
      <MediaProgressEvents
        onTimeUpdate={onTimeUpdate}
        onPause={onPause}
        onSeeked={onSeeked}
        onEnded={handleEnded}
      />
      {overlay}
      <DefaultVideoLayout
        icons={defaultLayoutIcons}
        thumbnails={thumbnailVtt}
        smallLayoutWhen={false}
        translations={{ Captions: "Subtitles" }}
        slots={{
          settingsMenuItemsStart: (
            <>
              <AudioTrackSelector originalLocale={originalAudioLocale} />
              <QualitySelector />
              <FormatSelector />
            </>
          ),
          beforeFullscreenButton: <VideoPlayerLayoutControls />,
        }}
      />
      <PlayerSeeker startTime={startTime} />
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
