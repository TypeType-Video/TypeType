import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PlaylistActions } from "../components/playlist-actions";
import { PublicPlaylistHeader } from "../components/public-playlist-header";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { Toast } from "../components/toast";
import { VideoGrid } from "../components/video-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { usePublicPlaylist } from "../hooks/use-public-playlist";
import { useSavedPlaylists } from "../hooks/use-saved-playlists";
import { randomShuffleSeed, shuffleByKey } from "../lib/playlist-shuffle";
import { playlistListId } from "../lib/playlist-url";
import { toPublicWatchParam } from "../lib/watch-url";

function PublicPlaylistPage() {
  const { list, url } = Route.useSearch();
  const playlistUrl = url || (list ? `https://www.youtube.com/playlist?list=${list}` : "");
  const listId = list || playlistListId(playlistUrl) || undefined;
  const { data, isLoading, isError, isFetchingNextPage, hasNextPage, fetchNextPage } =
    usePublicPlaylist(playlistUrl);
  const savedPlaylists = useSavedPlaylists();
  const { filter } = useBlockedFilter();
  const navigate = useNavigate();
  const [toast, setToast] = useState<string | null>(null);
  const saved = savedPlaylists.findSaved(playlistUrl);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!playlistUrl) return <p className="text-fg-muted text-sm">No playlist selected.</p>;
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
  function playFrom(url: string | undefined, shuffle?: string) {
    if (!url) return;
    navigate({
      to: "/watch",
      search: {
        v: toPublicWatchParam(url),
        ...(listId ? { list: listId } : {}),
        ...(shuffle ? { shuffle } : {}),
      },
    });
  }

  function toggleSaved() {
    if (saved) {
      savedPlaylists.remove.mutate(saved.id, { onSuccess: () => setToast("Playlist removed") });
      return;
    }
    savedPlaylists.save.mutate(playlistUrl, { onSuccess: () => setToast("Playlist saved") });
  }

  return (
    <div className="flex flex-col gap-6 pt-2 sm:pt-4 [animation:page-fade-in_0.2s_ease-out]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {info && <PublicPlaylistHeader info={info} />}
        {streams.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <PlaylistActions
              onPlayAll={() => playFrom(streams[0]?.id)}
              onShuffle={() => {
                const seed = randomShuffleSeed();
                playFrom(shuffleByKey(streams, seed)[0]?.id, seed);
              }}
            />
            <button
              type="button"
              onClick={toggleSaved}
              disabled={savedPlaylists.save.isPending || savedPlaylists.remove.isPending}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-3 py-1.5 font-medium text-fg text-xs transition-colors hover:bg-surface-strong disabled:opacity-50"
            >
              {saved ? (
                <BookmarkCheck className="h-3.5 w-3.5" />
              ) : (
                <BookmarkPlus className="h-3.5 w-3.5" />
              )}
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        )}
      </div>
      {streams.length === 0 ? (
        <p className="text-fg-muted text-sm">This playlist has no videos.</p>
      ) : (
        <VideoGrid streams={streams} listId={listId} />
      )}
      {isFetchingNextPage && <VideoGridSkeleton idPrefix="public-playlist-next" />}
      <ScrollSentinel onIntersect={loadMore} enabled={!!hasNextPage && !isFetchingNextPage} />
      <Toast message={toast} />
    </div>
  );
}

export const Route = createFileRoute("/playlist")({
  validateSearch: (search: Record<string, unknown>) => ({
    list: typeof search.list === "string" && search.list.length > 0 ? search.list : undefined,
    url: typeof search.url === "string" && search.url.length > 0 ? search.url : undefined,
  }),
  component: PublicPlaylistPage,
});
