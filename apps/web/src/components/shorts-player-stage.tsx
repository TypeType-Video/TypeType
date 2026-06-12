import { PageSpinner } from "../components/page-spinner";
import { ShortsActions } from "../components/shorts-actions";
import { ShortsCommentsSheetSlot } from "../components/shorts-comments-sheet-slot";
import { ShortsError } from "../components/shorts-error";
import { ShortsInfoOverlay } from "../components/shorts-info-overlay";
import { ShortsNavigation } from "../components/shorts-navigation";
import { ShortsVideoPlayer } from "../components/shorts-video-player";
import { resolveManifestSrc } from "../lib/stream-src";
import type { VideoStream } from "../types/stream";

type Props = {
  sectionClass: string;
  playerRef: React.RefObject<HTMLDivElement | null>;
  commentsOpen: boolean;
  active: VideoStream;
  current: VideoStream;
  stream: VideoStream | undefined;
  streamLoading: boolean;
  streamError: boolean;
  errorMessage: string;
  isMemberOnlyShort: boolean;
  hasPrev: boolean;
  hasNext: boolean;
  settingsReady: boolean;
  autoplay: boolean;
  initialVolume: number;
  initialMuted: boolean;
  defaultAudioLanguage?: string;
  preferOriginalLanguage?: boolean;
  originalAudioTrackId?: string | null;
  preferredDefaultAudioTrackId?: string | null;
  originalAudioLocale?: string | null;
  defaultSubtitleLanguage?: string;
  subtitlesEnabled?: boolean;
  showComments: boolean;
  onOpenComments: () => void;
  onCloseComments: () => void;
  onRetry: () => void;
  onNext: () => void;
  onAutoNext: () => void;
  onPrev: () => void;
  onWheel: (event: React.WheelEvent) => void;
  onTouchStart: (clientY: number | null, target: EventTarget | null) => void;
  onTouchEnd: (clientY: number | null, target: EventTarget | null) => void;
  onVolumeChange: (volume: number, muted: boolean) => void;
};
export function ShortsPlayerStage({
  sectionClass,
  playerRef,
  commentsOpen,
  active,
  current,
  stream,
  streamLoading,
  streamError,
  errorMessage,
  isMemberOnlyShort,
  hasPrev,
  hasNext,
  settingsReady,
  autoplay,
  initialVolume,
  initialMuted,
  defaultAudioLanguage,
  preferOriginalLanguage,
  originalAudioTrackId,
  preferredDefaultAudioTrackId,
  originalAudioLocale,
  defaultSubtitleLanguage,
  subtitlesEnabled,
  showComments,
  onOpenComments,
  onCloseComments,
  onRetry,
  onNext,
  onAutoNext,
  onPrev,
  onWheel,
  onTouchStart,
  onTouchEnd,
  onVolumeChange,
}: Props) {
  const shouldAutoplay = autoplay && !streamError;
  const playerSrc = stream
    ? resolveManifestSrc(stream, false, false, false, {
        compactAudioTracks: true,
        preferredAudioLanguage: preferOriginalLanguage ? undefined : defaultAudioLanguage,
        preferOriginalLanguage,
        maxCompactAudioTracks: 3,
      })
    : undefined;
  return (
    <section className={sectionClass}>
      <div className="relative flex h-full flex-col items-center justify-start md:flex-row md:justify-center">
        <div className="hidden md:absolute md:bottom-3 md:left-0 md:z-20 md:block">
          <ShortsInfoOverlay stream={current} variant="panel" />
        </div>
        <div className="relative flex w-full items-center justify-center gap-3 lg:gap-4 md:w-auto">
          <div
            ref={playerRef}
            className="shorts-shell relative aspect-[9/16] h-[calc(100svh-5.25rem)] w-auto max-h-[42rem] max-w-full overflow-hidden rounded-xl bg-black sm:rounded-2xl md:h-[calc(100svh-6rem)] md:max-h-none"
            onWheel={(event) => !commentsOpen && onWheel(event)}
            onTouchStart={(e) =>
              !commentsOpen && onTouchStart(e.touches[0]?.clientY ?? null, e.target)
            }
            onTouchEnd={(e) =>
              !commentsOpen && onTouchEnd(e.changedTouches[0]?.clientY ?? null, e.target)
            }
          >
            {!streamError && streamLoading && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-app/80">
                <PageSpinner fullScreen={false} />
              </div>
            )}
            {streamError && (
              <ShortsError
                message={
                  isMemberOnlyShort ? "This short is only available for members" : errorMessage
                }
                onRetry={onRetry}
                onNext={onNext}
              />
            )}
            {stream && !streamError && playerSrc && (
              <ShortsVideoPlayer
                key={stream.id}
                src={playerSrc}
                title={stream.title}
                poster={stream.thumbnail}
                subtitles={stream.subtitles}
                initialVolume={initialVolume}
                initialMuted={initialMuted}
                settingsReady={settingsReady}
                autoplay={shouldAutoplay}
                defaultAudioLanguage={defaultAudioLanguage}
                preferOriginalLanguage={preferOriginalLanguage}
                originalAudioTrackId={originalAudioTrackId}
                preferredDefaultAudioTrackId={preferredDefaultAudioTrackId}
                originalAudioLocale={originalAudioLocale}
                defaultSubtitleLanguage={defaultSubtitleLanguage}
                subtitlesEnabled={subtitlesEnabled}
                onVolumeChange={onVolumeChange}
                onError={onAutoNext}
                onEnded={onAutoNext}
              />
            )}
            <div className="pointer-events-none md:hidden">
              <ShortsInfoOverlay stream={current} />
            </div>
            <ShortsActions
              stream={active}
              onOpenComments={onOpenComments}
              showComments={showComments}
              className="absolute bottom-24 right-1.5 z-30 md:hidden"
              compact
            />
          </div>
          <div className="hidden flex-col items-center gap-3 md:flex">
            <ShortsActions
              stream={active}
              onOpenComments={onOpenComments}
              showComments={showComments}
            />
            <ShortsNavigation onPrev={onPrev} onNext={onNext} hasPrev={hasPrev} hasNext={hasNext} />
          </div>
        </div>
      </div>
      {showComments && (
        <ShortsCommentsSheetSlot
          videoUrl={active.id}
          anchorEl={playerRef.current}
          open={commentsOpen}
          onClose={onCloseComments}
        />
      )}
    </section>
  );
}
