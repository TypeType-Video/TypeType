import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CollectionPageHeader } from "../components/collection-page-header";
import { PlaylistGrid } from "../components/playlist-grid";
import { PlaylistSortMenu } from "../components/playlist-sort-menu";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useWatchLaterPlaylist } from "../hooks/use-watch-later-playlist";
import { useWatchLaterStreams } from "../hooks/use-watch-later-streams";
import { randomShuffleSeed, shuffleByKey } from "../lib/playlist-shuffle";
import { type PlaylistSortMode, sortPlaylistVideos } from "../lib/playlist-sort";
import { toPublicWatchParam } from "../lib/watch-url";

function WatchLaterPage() {
  const navigate = useNavigate();
  const [sortMode, setSortMode] = useState<PlaylistSortMode>("added-new");
  const { videos, playlistVideos, count, isLoading } = useWatchLaterStreams();
  const watchLater = useWatchLaterPlaylist();
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
      {!isLoading && videos.length > 0 && (
        <PlaylistSortMenu value={sortMode} onChange={setSortMode} />
      )}
      {isLoading ? (
        <VideoGridSkeleton idPrefix="watch-later" />
      ) : videos.length === 0 ? (
        <p className="py-24 text-center text-sm text-fg-muted">No videos saved for later.</p>
      ) : (
        <PlaylistGrid
          videos={visiblePlaylistVideos}
          reorderable={false}
          listId=""
          onRemove={(video) => void watchLater.remove(video.url)}
          onReorder={() => undefined}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/watch-later")({ component: WatchLaterPage });
