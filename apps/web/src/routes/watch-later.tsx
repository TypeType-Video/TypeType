import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { VideoGrid } from "../components/video-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useWatchLaterStreams } from "../hooks/use-watch-later-streams";

function WatchLaterPage() {
  const { videos, count, isLoading } = useWatchLaterStreams();
  const { filter } = useBlockedFilter();
  const visibleVideos = useMemo(() => filter(videos), [filter, videos]);

  return (
    <div className="flex flex-col gap-6 [animation:page-fade-in_0.2s_ease-out]">
      <header>
        <h1 className="text-lg font-semibold text-fg">Watch later</h1>
        <p className="text-xs text-fg-soft">
          {isLoading ? "Loading videos" : `${count} video${count !== 1 ? "s" : ""}`}
        </p>
      </header>
      {isLoading ? (
        <VideoGridSkeleton idPrefix="watch-later" />
      ) : videos.length === 0 ? (
        <p className="py-24 text-center text-sm text-fg-muted">No videos saved for later.</p>
      ) : (
        <VideoGrid streams={visibleVideos} />
      )}
    </div>
  );
}

export const Route = createFileRoute("/watch-later")({ component: WatchLaterPage });
