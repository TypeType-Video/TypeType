import type { MutableRefObject, ReactNode } from "react";
import type { AutoplayState } from "../hooks/use-watch-ended-navigation";
import type { MediaSrc } from "../lib/vidstack";
import type { SponsorBlockSegmentItem } from "../types/api";
import type { VideoStream } from "../types/stream";
import type { CaptionStyles, SettingsItem } from "../types/user";
import { AutoplayCountdownOverlay } from "./autoplay-countdown-overlay";
import { PageSpinner } from "./page-spinner";
import { PlayerError } from "./player-error";
import { VideoPlayer } from "./video-player";
import type { WatchLayoutClasses } from "./watch-layout-classes";
import { WatchMeta } from "./watch-meta";

type Props = {
  classes: WatchLayoutClasses;
  stream: VideoStream;
  settings: SettingsItem;
  manifestSrc: MediaSrc;
  playerKey: string;
  startTime: number;
  isLive: boolean;
  settingsReady: boolean;
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
  onCaptionStylesChange: (styles: CaptionStyles) => void;
  onVolumeChange: (volume: number, muted: boolean) => void;
  onTimeUpdate: (positionMs: number) => void;
  onPause: () => void;
  onSeeked: () => void;
  onEnded: () => void;
  onAutoplayPlayNow: () => void;
  onAutoplayCancel: () => void;
  onAutoplayPauseToggle: () => void;
  onError: () => void;
  onReset: () => void;
};

export function WatchStage({
  classes,
  stream,
  settings,
  manifestSrc,
  playerKey,
  startTime,
  isLive,
  settingsReady,
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
  onCaptionStylesChange,
  onVolumeChange,
  onTimeUpdate,
  onPause,
  onSeeked,
  onEnded,
  onAutoplayPlayNow,
  onAutoplayCancel,
  onAutoplayPauseToggle,
  onError,
  onReset,
}: Props) {
  return (
    <div className={classes.playerWrapClass}>
      <div className={classes.playerBoxClass}>
        {navigating ? (
          <div className="flex aspect-video w-full items-center justify-center bg-black">
            <PageSpinner fullScreen={false} />
          </div>
        ) : settingsReady ? (
          <>
            <VideoPlayer
              key={playerKey}
              src={manifestSrc}
              title={stream.title}
              poster={stream.thumbnail}
              streamType={isLive ? "live" : "on-demand"}
              startTime={startTime}
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
              onCaptionStylesChange={onCaptionStylesChange}
              onVolumeChange={onVolumeChange}
              onTimeUpdate={onTimeUpdate}
              onPause={onPause}
              onSeeked={onSeeked}
              onError={onError}
              onEnded={onEnded}
              onSeekReady={(seek) => (seekRef.current = seek)}
              className={classes.playerClassName}
              mediaClassName={classes.mediaClassName}
            />
            {playerFailed && <PlayerError onRetry={onReset} />}
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
        ) : (
          <div className="aspect-video w-full bg-black" />
        )}
      </div>
      {mobilePanel ? <div className="mt-4">{mobilePanel}</div> : null}
      {!cinemaMode && (
        <WatchMeta
          stream={stream}
          showComments={!hideComments}
          onSeekTimestamp={(seconds) => seekRef.current?.(seconds)}
        />
      )}
    </div>
  );
}
