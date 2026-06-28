import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CollectionPageHeader } from "../components/collection-page-header";
import { PlaylistGrid } from "../components/playlist-grid";
import { PlaylistSortMenu } from "../components/playlist-sort-menu";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useFavoriteStreams } from "../hooks/use-favorite-streams";
import { useFavoritesPlaylist } from "../hooks/use-favorites-playlist";
import { randomShuffleSeed, shuffleByKey } from "../lib/playlist-shuffle";
import { type PlaylistSortMode, sortPlaylistVideos } from "../lib/playlist-sort";
import { toPublicWatchParam } from "../lib/watch-url";

const FAVORITES_BATCH_SIZE = 12;

function FavoritesPage() {
  const navigate = useNavigate();
  const [limit, setLimit] = useState(FAVORITES_BATCH_SIZE);
  const [sortMode, setSortMode] = useState<PlaylistSortMode>("added-new");
  const { videos, playlistVideos, count, requestedCount, isLoading } = useFavoriteStreams({
    limit,
  });
  const favorites = useFavoritesPlaylist();
  const { filter } = useBlockedFilter();
  const visibleVideos = useMemo(() => filter(videos), [filter, videos]);
  const visibleIds = useMemo(
    () => new Set(visibleVideos.map((video) => video.id)),
    [visibleVideos],
  );
  const visiblePlaylistVideos = useMemo(
    () => sortPlaylistVideos(playlistVideos, sortMode).filter((video) => visibleIds.has(video.url)),
    [playlistVideos, sortMode, visibleIds],
  );
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
      {!isLoading && videos.length > 0 && (
        <PlaylistSortMenu value={sortMode} onChange={setSortMode} />
      )}
      {isLoading ? (
        <VideoGridSkeleton idPrefix="favorites" />
      ) : videos.length === 0 ? (
        <p className="py-24 text-center text-sm text-fg-muted">No favorites yet.</p>
      ) : (
        <>
          <PlaylistGrid
            videos={visiblePlaylistVideos}
            reorderable={false}
            listId=""
            onRemove={(video) => void favorites.remove(video.url)}
            onReorder={() => undefined}
          />
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
