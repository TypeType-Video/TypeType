import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { VideoGrid } from "../components/video-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useFavoriteStreams } from "../hooks/use-favorite-streams";

const FAVORITES_BATCH_SIZE = 12;

function FavoritesPage() {
  const [limit, setLimit] = useState(FAVORITES_BATCH_SIZE);
  const { videos, count, requestedCount, isLoading } = useFavoriteStreams({ limit });
  const { filter } = useBlockedFilter();
  const visibleVideos = useMemo(() => filter(videos), [filter, videos]);
  const canLoadMore = requestedCount < count;

  return (
    <div className="flex flex-col gap-6 [animation:page-fade-in_0.2s_ease-out]">
      <header>
        <h1 className="text-lg font-semibold text-fg">Favorites</h1>
        <p className="text-xs text-fg-soft">
          {isLoading ? "Loading videos" : `${count} video${count !== 1 ? "s" : ""}`}
        </p>
      </header>
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
