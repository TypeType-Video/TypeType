import type { MutableRefObject, ReactNode } from "react";
import type { WatchAudioOnlyControls } from "../hooks/use-watch-audio-only-playback";
import type { AutoplayState } from "../hooks/use-watch-ended-navigation";
import type { SabrPlaybackConfig } from "../lib/sabr-source";
import type { MediaSrc } from "../lib/vidstack";
import type { SponsorBlockSegmentItem } from "../types/api";
import type { VideoStream } from "../types/stream";
import type { CaptionStyles, SettingsItem } from "../types/user";
import { AutoplayCountdownOverlay } from "./autoplay-countdown-overlay";
import { PageSpinner } from "./page-spinner";
import { PlayerError } from "./player-error";
import type { WatchLayoutClasses } from "./watch-layout-classes";
import { WatchMeta } from "./watch-meta";
import { WatchStagePlayer } from "./watch-stage-player";

type Props = {
  classes: WatchLayoutClasses;
  stream: VideoStream;
  settings: SettingsItem;
  manifestSrc: MediaSrc;
  sabrConfig: SabrPlaybackConfig | null;
  audioOnly: boolean;
  playerKey: string;
  startTime: number;
  isLive: boolean;
  settingsReady: boolean;
  autoplay: boolean;
  navigating: boolean;
  originalLocale: string | null;
  overlay: ReactNode;
  autoplayState: AutoplayState | null;
  sponsorBlockSegments?: SponsorBlockSegmentItem[];
  autoSkipSegments?: SponsorBlockSegmentItem[];
  manualSkipSegments?: SponsorBlockSegmentItem[];
  thumbnailVtt?: string;
  chaptersVtt?: string;
  playerFailed: boolean;
  cinemaMode: boolean;
  hideComments: boolean;
  mobilePanel: ReactNode;
  seekRef: MutableRefObject<((seconds: number) => void) | null>;
  audioOnlyControls: WatchAudioOnlyControls;
  onCaptionStylesChange: (styles: CaptionStyles) => void;
  onVolumeChange: (volume: number, muted: boolean) => void;
  onTimeUpdate: (positionMs: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onSeeking: (positionMs: number) => void;
  onSeeked: () => void;
  onEnded: () => void;
  onAutoplayPlayNow: () => void;
  onAutoplayCancel: () => void;
  onAutoplayPauseToggle: () => void;
  onPositionReaderChange: (reader: (() => number | null) | null) => void;
  onPreviousVideo?: () => void;
  onNextVideo?: () => void;
  onError: () => void;
  onReset: () => void;
};

export function WatchStage({
  classes,
  stream,
  settings,
  manifestSrc,
  sabrConfig,
  audioOnly,
  playerKey,
  startTime,
  isLive,
  settingsReady,
  autoplay,
  navigating,
  originalLocale,
  overlay,
  autoplayState,
  sponsorBlockSegments,
  autoSkipSegments,
  manualSkipSegments,
  thumbnailVtt,
  chaptersVtt,
  playerFailed,
  cinemaMode,
  hideComments,
  mobilePanel,
  seekRef,
  audioOnlyControls,
  onCaptionStylesChange,
  onVolumeChange,
  onTimeUpdate,
  onPlay,
  onPause,
  onSeeking,
  onSeeked,
  onEnded,
  onAutoplayPlayNow,
  onAutoplayCancel,
  onAutoplayPauseToggle,
  onPositionReaderChange,
  onPreviousVideo,
  onNextVideo,
  onError,
  onReset,
}: Props) {
  const playerOverlay = (
    <>
      {overlay}
      {autoplayState && (
        <AutoplayCountdownOverlay
          target={autoplayState.target}
          totalSeconds={autoplayState.totalSeconds}
          paused={autoplayState.paused}
          onPlayNow={onAutoplayPlayNow}
          onCancel={onAutoplayCancel}
          onPauseToggle={onAutoplayPauseToggle}
        />
      )}
    </>
  );

  return (
    <div className={classes.playerWrapClass}>
      <div className={classes.playerBoxClass}>
        {navigating ? (
          <div className="flex aspect-video w-full items-center justify-center bg-black">
            <PageSpinner fullScreen={false} />
          </div>
        ) : playerFailed ? (
          <div className="flex aspect-video w-full items-center justify-center bg-black">
            <PlayerError onRetry={onReset} />
          </div>
        ) : (
          <WatchStagePlayer
            audioOnly={audioOnly}
            streamTitle={stream.title}
            poster={stream.thumbnail}
            playerKey={playerKey}
            manifestSrc={manifestSrc}
            sabrConfig={sabrConfig}
            isLive={isLive}
            startTime={startTime}
            subtitles={stream.subtitles}
            sponsorBlockSegments={sponsorBlockSegments}
            autoSkipSegments={autoSkipSegments}
            manualSkipSegments={manualSkipSegments}
            settings={settings}
            settingsReady={settingsReady}
            autoplay={autoplay}
            originalLocale={originalLocale}
            overlay={playerOverlay}
            seekRef={seekRef}
            thumbnailVtt={thumbnailVtt}
            chaptersVtt={chaptersVtt}
            playerClassName={classes.playerClassName}
            mediaClassName={classes.mediaClassName}
            onCaptionStylesChange={onCaptionStylesChange}
            onVolumeChange={onVolumeChange}
            onTimeUpdate={onTimeUpdate}
            onPlay={onPlay}
            onPause={onPause}
            onSeeking={onSeeking}
            onSeeked={onSeeked}
            onError={onError}
            onPositionReaderChange={onPositionReaderChange}
            onEnded={onEnded}
            onPreviousVideo={onPreviousVideo}
            onNextVideo={onNextVideo}
          />
        )}
      </div>
      {mobilePanel ? <div className="mt-4">{mobilePanel}</div> : null}
      {!cinemaMode && (
        <WatchMeta
          stream={stream}
          showComments={!hideComments}
          onSeekTimestamp={(seconds) => seekRef.current?.(seconds)}
          audioOnly={audioOnlyControls}
        />
      )}
    </div>
  );
}
