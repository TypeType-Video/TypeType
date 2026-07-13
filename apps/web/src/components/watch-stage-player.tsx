import type { MutableRefObject, ReactNode } from "react";
import type { SabrPlaybackConfig } from "../lib/sabr-source";
import type { MediaSrc } from "../lib/vidstack";
import type { SponsorBlockSegmentItem, SubtitleItem } from "../types/api";
import type { CaptionStyles, SettingsItem } from "../types/user";
import { VideoPlayer } from "./video-player";
import { WatchPlayerCrossfade } from "./watch-player-crossfade";

type Props = {
  audioOnly: boolean;
  streamTitle: string;
  poster?: string;
  playerKey: string;
  manifestSrc: MediaSrc;
  sabrConfig: SabrPlaybackConfig | null;
  isLive: boolean;
  startTime: number;
  seekIntervalSeconds?: number;
  subtitles?: SubtitleItem[];
  sponsorBlockSegments?: SponsorBlockSegmentItem[];
  autoSkipSegments?: SponsorBlockSegmentItem[];
  manualSkipSegments?: SponsorBlockSegmentItem[];
  settings: SettingsItem;
  settingsReady: boolean;
  autoplay: boolean;
  originalLocale: string | null;
  overlay: ReactNode;
  seekRef: MutableRefObject<((seconds: number) => void) | null>;
  thumbnailVtt?: string;
  chaptersVtt?: string;
  playerClassName?: string;
  mediaClassName?: string;
  onCaptionStylesChange: (styles: CaptionStyles) => void;
  onVolumeChange: (volume: number, muted: boolean) => void;
  onTimeUpdate: (positionMs: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onSeeking: (positionMs: number) => void;
  onSeeked: () => void;
  onError: () => void;
  onPositionReaderChange: (reader: (() => number | null) | null) => void;
  onEnded: () => void;
  onPreviousVideo?: () => void;
  onNextVideo?: () => void;
};

export function WatchStagePlayer(props: Props) {
  const settings = props.settings;
  return (
    <WatchPlayerCrossfade
      audioOnly={props.audioOnly}
      poster={props.poster}
      title={props.streamTitle}
    >
      <VideoPlayer
        key={props.playerKey}
        src={props.manifestSrc}
        sabrConfig={props.sabrConfig}
        audioOnly={props.audioOnly}
        title={props.streamTitle}
        poster={props.poster}
        streamType={props.isLive ? "live" : "on-demand"}
        startTime={props.startTime}
        seekIntervalSeconds={props.seekIntervalSeconds}
        subtitles={props.subtitles}
        sponsorBlockSegments={props.sponsorBlockSegments}
        autoSkipSponsorBlock={Boolean(props.autoSkipSegments)}
        autoSkipSponsorBlockSegments={props.autoSkipSegments}
        manualSkipSponsorBlockSegments={props.manualSkipSegments}
        muteSponsorBlockInsteadOfSkip={settings.sponsorBlockMuteInsteadOfSkip}
        showCurrentSponsorBlockSegment={settings.sponsorBlockShowCurrentSegment}
        thumbnailVtt={props.thumbnailVtt}
        chaptersVtt={props.chaptersVtt}
        initialVolume={settings.volume}
        initialMuted={settings.muted}
        settingsReady={props.settingsReady}
        autoplay={props.autoplay}
        originalAudioLocale={props.originalLocale}
        overlay={props.overlay}
        captionStyles={settings.captionStyles}
        onCaptionStylesChange={props.onCaptionStylesChange}
        onVolumeChange={props.onVolumeChange}
        onTimeUpdate={props.onTimeUpdate}
        onPlay={props.onPlay}
        onPause={props.onPause}
        onSeeking={props.onSeeking}
        onSeeked={props.onSeeked}
        onError={props.onError}
        onPositionReaderChange={props.onPositionReaderChange}
        onEnded={props.onEnded}
        onPreviousVideo={props.onPreviousVideo}
        onNextVideo={props.onNextVideo}
        onSeekReady={(seek) => (props.seekRef.current = seek)}
        className={props.playerClassName}
        mediaClassName={props.mediaClassName}
      />
    </WatchPlayerCrossfade>
  );
}
