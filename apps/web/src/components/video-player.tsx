import { useState } from "react";
import { isIosDevice } from "../lib/ios-device";
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
  MediaPlayer,
  MediaProvider,
  Track,
} from "../lib/vidstack";
import { AudioTrackSelector } from "./audio-track-selector";
import { CinemaModeControl } from "./cinema-mode-control";
import { FormatSelector } from "./format-selector";
import { MediaSessionSync } from "./media-session-sync";
import { PlayerHotkeys } from "./player-hotkeys";
import { PlayerSeeker, SeekBridge, SponsorBlockSkipper } from "./player-internals";
import { QualitySelector } from "./quality-selector";
import { SponsorBlockBar } from "./sponsorblock-bar";
import { SponsorBlockCurrentSegment } from "./sponsorblock-current-segment";
import {
  type FontSize,
  fontSizeToMultiplier,
  SubtitleSizeSelector,
} from "./subtitle-size-selector";
import { buildSafeSubtitleTracks } from "./subtitle-track-utils";
import { ChaptersTrack, onProviderChange } from "./video-player-core";
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
  const [subtitleSize, setSubtitleSize] = useState<FontSize>("normal");
  const subtitleTracks = buildSafeSubtitleTracks(subtitles);
  const hasSubtitles = subtitleTracks.length > 0;
  const subtitleStyle: Record<`--${string}`, string | number> = {
    "--media-user-font-size": fontSizeToMultiplier(subtitleSize),
    "--media-user-font-family":
      "system-ui, -apple-system, 'Segoe UI', 'Noto Sans', 'Noto Sans CJK JP', 'Noto Sans Arabic', 'Hiragino Sans', 'Yu Gothic', 'Microsoft YaHei', 'WenQuanYi Micro Hei', sans-serif",
  };
  return (
    <MediaPlayer
      className={className ? `w-full h-full dark ${className}` : "w-full h-full dark"}
      src={src}
      viewType="video"
      streamType={streamType}
      logLevel="warn"
      crossOrigin
      playsInline
      {...(ios ? { "webkit-playsinline": "true" } : {})}
      autoPlay={autoplay}
      storage={null}
      title={title}
      poster={poster}
      style={hasSubtitles ? subtitleStyle : undefined}
      onProviderChange={onProviderChange}
      onTimeUpdate={({ currentTime }) => onTimeUpdate?.(currentTime * 1000)}
      onPause={() => onPause?.()}
      onSeeked={(currentTime) => {
        onTimeUpdate?.(currentTime * 1000);
        onSeeked?.();
      }}
      onError={() => onError?.()}
      onEnded={() => onEnded?.()}
    >
      <MediaProvider
        className={mediaClassName ?? "h-full w-full"}
        mediaProps={mediaClassName ? { className: mediaClassName } : undefined}
      >
        {subtitleTracks.map((s) => (
          <Track
            key={s.key}
            kind="subtitles"
            src={s.src}
            label={s.label}
            lang={s.lang}
            type="vtt"
          />
        ))}
        {chaptersVtt && <ChaptersTrack src={chaptersVtt} />}
      </MediaProvider>
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
          beforeFullscreenButton: <CinemaModeControl />,
          captionsMenuItemsEnd: hasSubtitles ? (
            <SubtitleSizeSelector value={subtitleSize} onChange={setSubtitleSize} />
          ) : undefined,
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
      <MediaSessionSync
        title={title}
        artwork={poster}
        canSeek={streamType !== "live"}
        isLive={streamType === "live"}
      />
      <PlayerHotkeys canSeek={streamType !== "live"} />
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
