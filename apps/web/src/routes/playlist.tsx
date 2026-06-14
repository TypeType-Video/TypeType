import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback } from "react";
import { PublicPlaylistHeader } from "../components/public-playlist-header";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { VideoGrid } from "../components/video-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { usePublicPlaylist } from "../hooks/use-public-playlist";

function PublicPlaylistPage() {
  const { list } = Route.useSearch();
  const playlistUrl = list ? `https://www.youtube.com/playlist?list=${list}` : "";
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } =
    usePublicPlaylist(playlistUrl);
  const { filter } = useBlockedFilter();

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!list) return <p className="text-fg-muted text-sm">No playlist selected.</p>;
  if (isLoading) return <VideoGridSkeleton idPrefix="public-playlist" />;
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-2 text-center">
        <p className="text-fg-muted text-sm">This playlist could not be loaded.</p>
        <Link to="/" className="text-xs text-fg-soft hover:text-fg-muted transition-colors">
          Back home
        </Link>
      </div>
    );
  }

  const info = data.pages[0]?.playlist;
  const streams = filter(data.pages.flatMap((p) => p.streams));

  return (
    <div className="flex flex-col gap-6 [animation:page-fade-in_0.2s_ease-out]">
      {info && <PublicPlaylistHeader info={info} />}
      {streams.length === 0 ? (
        <p className="text-fg-muted text-sm">This playlist has no videos.</p>
      ) : (
        <VideoGrid streams={streams} />
      )}
      {isFetchingNextPage && <VideoGridSkeleton idPrefix="public-playlist-next" />}
      <ScrollSentinel onIntersect={loadMore} enabled={!!hasNextPage && !isFetchingNextPage} />
    </div>
  );
}

export const Route = createFileRoute("/playlist")({
  validateSearch: (search: Record<string, unknown>) => ({
    list: typeof search.list === "string" ? search.list : "",
  }),
  component: PublicPlaylistPage,
});
