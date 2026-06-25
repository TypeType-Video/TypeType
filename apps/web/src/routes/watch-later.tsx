import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { CollectionPageHeader } from "../components/collection-page-header";
import { VideoGrid } from "../components/video-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useWatchLaterStreams } from "../hooks/use-watch-later-streams";
import { randomShuffleSeed, shuffleByKey } from "../lib/playlist-shuffle";
import { toPublicWatchParam } from "../lib/watch-url";

function WatchLaterPage() {
  const navigate = useNavigate();
  const { videos, count, isLoading } = useWatchLaterStreams();
  const { filter } = useBlockedFilter();
  const visibleVideos = useMemo(() => filter(videos), [filter, videos]);

  function playVideo(id: string, shuffle?: string) {
    navigate({
      to: "/watch",
      search: { v: toPublicWatchParam(id), ...(shuffle ? { shuffle } : {}) },
    });
  }

  return (
    <div className="flex flex-col gap-6 pt-2 sm:pt-4 [animation:page-fade-in_0.2s_ease-out]">
      <CollectionPageHeader
        title="Watch later"
        count={count}
        loading={isLoading}
        canPlay={visibleVideos.length > 0}
        onPlayAll={() => {
          const first = visibleVideos[0];
          if (first) playVideo(first.id);
        }}
        onShuffle={() => {
          const seed = randomShuffleSeed();
          const first = shuffleByKey(visibleVideos, seed)[0];
          if (first) playVideo(first.id, seed);
        }}
      />
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
