import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CollectionPageHeader } from "../components/collection-page-header";
import { VideoGrid } from "../components/video-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useFavoriteStreams } from "../hooks/use-favorite-streams";
import { randomShuffleSeed, shuffleByKey } from "../lib/playlist-shuffle";
import { toPublicWatchParam } from "../lib/watch-url";

const FAVORITES_BATCH_SIZE = 12;

function FavoritesPage() {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(FAVORITES_BATCH_SIZE);
  const { videos, count, requestedCount, isLoading } = useFavoriteStreams({ limit });
  const { filter } = useBlockedFilter();
  const visibleVideos = useMemo(() => filter(videos), [filter, videos]);
  const canLoadMore = requestedCount < count;

  function playFrom(index: number, shuffle?: string) {
    const video = visibleVideos[index];
    if (!video) return;
    navigate({
      to: "/watch",
      search: { v: toPublicWatchParam(video.id), ...(shuffle ? { shuffle } : {}) },
    });
  }

  return (
    <div className="flex flex-col gap-6 pt-2 sm:pt-4 [animation:page-fade-in_0.2s_ease-out]">
      <CollectionPageHeader
        title="Favorites"
        count={count}
        loading={isLoading}
        canPlay={visibleVideos.length > 0}
        onPlayAll={() => playFrom(0)}
        onShuffle={() => {
          const seed = randomShuffleSeed();
          const shuffled = shuffleByKey(visibleVideos, seed);
          const first = shuffled[0];
          if (!first) return;
          navigate({ to: "/watch", search: { v: toPublicWatchParam(first.id), shuffle: seed } });
        }}
      />
      {isLoading ? (
        <VideoGridSkeleton idPrefix="favorites" />
      ) : videos.length === 0 ? (
        <p className="py-24 text-center text-sm text-fg-muted">No favorites yet.</p>
      ) : (
        <>
          <VideoGrid streams={visibleVideos} />
          {canLoadMore && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setLimit((current) => current + FAVORITES_BATCH_SIZE)}
                className="rounded-lg bg-surface-strong px-4 py-2 text-sm text-fg transition-colors hover:bg-surface-soft"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export const Route = createFileRoute("/favorites")({ component: FavoritesPage });
