import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "../components/confirm-modal";
import { PlaylistActions } from "../components/playlist-actions";
import { PlaylistGrid } from "../components/playlist-grid";
import { PlaylistRenameModal } from "../components/playlist-rename-modal";
import { PlaylistSortMenu } from "../components/playlist-sort-menu";
import { usePlaylist } from "../hooks/use-playlist";
import { usePlaylists } from "../hooks/use-playlists";
import { randomShuffleSeed, shuffleByKey } from "../lib/playlist-shuffle";
import { type PlaylistSortMode, sortPlaylistVideos } from "../lib/playlist-sort";
import { markWatchAutoplayIntent } from "../lib/watch-autoplay-intent";
import { toPublicWatchParam } from "../lib/watch-url";
import type { PlaylistVideoItem } from "../types/user";

function PlaylistDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { remove, removeVideo, rename, reorder } = usePlaylists();
  const { data: playlist, isPending } = usePlaylist(id);
  const [renaming, setRenaming] = useState(false);
  const [pendingRemove, setPendingRemove] = useState<PlaylistVideoItem | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [sortMode, setSortMode] = useState<PlaylistSortMode>("manual");

  if (isPending) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-fg-soft text-sm">Loading...</p>
      </div>
    );
  }
  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-32 text-center">
        <p className="text-fg-muted text-sm">Playlist not found.</p>
        <Link
          to="/playlists"
          className="text-fg-soft text-xs transition-colors hover:text-fg-muted"
        >
          Back to playlists
        </Link>
      </div>
    );
  }

  const videos = playlist.videos ?? [];
  const count = videos.length;
  const sortedVideos = sortPlaylistVideos(videos, sortMode);
  const reorderable = sortMode === "manual";

  function handleDelete() {
    remove.mutate(id);
    navigate({ to: "/playlists" });
  }
  function playFrom(video: PlaylistVideoItem | undefined, shuffle?: string) {
    if (!video) return;
    markWatchAutoplayIntent();
    navigate({
      to: "/watch",
      search: { v: toPublicWatchParam(video.url), list: id, ...(shuffle ? { shuffle } : {}) },
    });
  }
  function handleShuffle() {
    const seed = randomShuffleSeed();
    playFrom(shuffleByKey(sortedVideos, seed)[0], seed);
  }

  return (
    <div className="flex flex-col gap-6 pt-2 sm:pt-4 [animation:page-fade-in_0.2s_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/playlists"
            className="text-fg-soft transition-colors hover:text-fg"
            aria-label="Back to playlists"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-semibold text-fg text-lg">{playlist.name}</h1>
              <button
                type="button"
                onClick={() => setRenaming(true)}
                className="text-fg-soft transition-colors hover:text-fg-muted"
                aria-label="Rename playlist"
              >
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
            <p className="text-fg-soft text-xs">
              {count} video{count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {count > 0 && (
            <>
              <PlaylistActions
                onPlayAll={() => playFrom(sortedVideos[0])}
                onShuffle={handleShuffle}
              />
              <PlaylistSortMenu value={sortMode} onChange={setSortMode} />
            </>
          )}
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-lg px-3 py-1.5 text-danger text-xs transition-colors hover:bg-danger/10"
          >
            Delete playlist
          </button>
        </div>
      </div>
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-32 text-center">
          <p className="text-fg-muted text-sm">No videos in this playlist yet.</p>
          <p className="text-fg-soft text-xs">
            Save videos from the watch page using the Save button.
          </p>
        </div>
      ) : (
        <PlaylistGrid
          videos={sortedVideos}
          reorderable={reorderable}
          listId={id}
          onRemove={setPendingRemove}
          onReorder={(order) => reorder.mutate({ id, order })}
        />
      )}
      {pendingRemove && (
        <ConfirmModal
          title="Remove video"
          description={`Remove "${pendingRemove.title}" from this playlist?`}
          confirmLabel="Remove"
          onConfirm={() => {
            removeVideo.mutate({ playlistId: playlist.id, videoUrl: pendingRemove.url });
            setPendingRemove(null);
          }}
          onCancel={() => setPendingRemove(null)}
        />
      )}
      {confirmingDelete && (
        <ConfirmModal
          title="Delete playlist"
          description={`Delete "${playlist.name}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={() => {
            setConfirmingDelete(false);
            handleDelete();
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
      {renaming && (
        <PlaylistRenameModal
          currentName={playlist.name}
          onConfirm={(name) => {
            rename.mutate({ id, name });
            setRenaming(false);
          }}
          onCancel={() => setRenaming(false)}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute("/playlists_/$id")({ component: PlaylistDetailPage });
