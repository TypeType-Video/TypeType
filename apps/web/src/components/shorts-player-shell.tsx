import { useRef, useState } from "react";
import { ShortsPlayerStage } from "../components/shorts-player-stage";
import { ShortsShellLoader } from "../components/shorts-shell-loader";
import { useMobile } from "../hooks/use-mobile";
import { useSettings } from "../hooks/use-settings";
import { useShortsActiveStream } from "../hooks/use-shorts-active-stream";
import { useShortsFeed } from "../hooks/use-shorts-feed";
import { useShortsPrefetch } from "../hooks/use-shorts-prefetch";
import { useShortsRouteSync } from "../hooks/use-shorts-route-sync";
import { useVolumeSync } from "../hooks/use-volume-sync";
import {
  getOriginalAudioLocale,
  getOriginalAudioTrackId,
  getPreferredDefaultAudioTrackId,
} from "../lib/audio-track";
import { useShortsNavigation } from "../lib/shorts-navigation";
import { useUiStore } from "../stores/ui-store";

type Props = {
  targetUrl?: string;
};

export function ShortsPlayerShell({ targetUrl }: Props) {
  const isMobile = useMobile();
  const { shorts, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } = useShortsFeed();
  const { settings, update, query: settingsQuery } = useSettings();
  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed);
  const playerRef = useRef<HTMLDivElement>(null);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const settingsReady =
    (settingsQuery.isSuccess && !settingsQuery.isPlaceholderData) || settingsQuery.isError;

  const handleAutoNext = () => {
    moveBy(1, "auto");
  };
  const { index, moveBy, moveTo, onWheel, onTouchStart, onTouchEnd } = useShortsNavigation(
    shorts.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  );
  const { active, activeId, stream, streamQuery, current, errorMessage, isMemberOnlyShort } =
    useShortsActiveStream({ shorts, index });
  const originalAudioTrackId = getOriginalAudioTrackId(stream);
  const preferredDefaultAudioTrackId = getPreferredDefaultAudioTrackId(stream);
  const originalAudioLocale = getOriginalAudioLocale(stream);
  const onVolumeChange = useVolumeSync(update.mutate);
  useShortsPrefetch(
    shorts.map((item) => item.id),
    index,
  );

  useShortsRouteSync({
    targetUrl,
    shorts,
    index,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage: () => void fetchNextPage(),
    moveTo,
    activeId,
    onActiveChange: () => setCommentsOpen(false),
  });

  const sectionClass = `h-[calc(100svh-4.5rem)] overflow-hidden px-2 pb-2 pt-1 sm:px-4 sm:pb-4 sm:pt-3 ${
    isMobile ? "pl-2" : sidebarCollapsed ? "md:pl-16" : "md:pl-52"
  }`;
  if (isLoading) return <ShortsShellLoader sectionClass={sectionClass} />;
  if (!active) {
    return (
      <div className="flex items-center justify-center pt-24">
        <p className="text-sm text-fg-muted">No shorts available right now.</p>
      </div>
    );
  }
  const hasPrev = index > 0;
  const hasNext = index < shorts.length - 1 || hasNextPage;

  const handleWheel = (e: React.WheelEvent) => {
    const target = e.target as HTMLElement;
    const isMenu = target.closest("[role='menu'], .vds-menu-items") !== null;
    if (!isMenu) onWheel(e.deltaY);
  };

  const handleTouchStart = (clientY: number | null, target: EventTarget | null) => {
    onTouchStart(clientY, target);
  };

  const handleTouchEnd = (clientY: number | null, target: EventTarget | null) => {
    onTouchEnd(clientY, target);
  };

  return (
    <ShortsPlayerStage
      sectionClass={sectionClass}
      playerRef={playerRef}
      commentsOpen={commentsOpen}
      active={active}
      current={current}
      stream={stream}
      streamLoading={streamQuery.isLoading}
      streamError={streamQuery.isError}
      errorMessage={errorMessage}
      isMemberOnlyShort={isMemberOnlyShort}
      hasPrev={hasPrev}
      hasNext={hasNext}
      settingsReady={settingsReady}
      autoplay={settings.autoplay}
      initialVolume={settings.volume}
      initialMuted={settings.muted}
      defaultAudioLanguage={settings.defaultAudioLanguage || undefined}
      preferOriginalLanguage={settings.preferOriginalLanguage}
      originalAudioTrackId={originalAudioTrackId}
      preferredDefaultAudioTrackId={preferredDefaultAudioTrackId}
      originalAudioLocale={originalAudioLocale}
      defaultSubtitleLanguage={settings.defaultSubtitleLanguage || undefined}
      subtitlesEnabled={settings.subtitlesEnabled}
      showComments={!settings.hideComments}
      onOpenComments={() => setCommentsOpen(true)}
      onCloseComments={() => setCommentsOpen(false)}
      onRetry={() => streamQuery.refetch()}
      onNext={() => moveBy(1, "user")}
      onAutoNext={handleAutoNext}
      onPrev={() => moveBy(-1, "user")}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onVolumeChange={onVolumeChange}
    />
  );
}
