import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { proxyImage } from "../lib/proxy";
import type { SavedPlaylistItem } from "../types/playlist";

type Props = {
  playlist: SavedPlaylistItem;
  onDelete: () => void;
};

export function SavedPlaylistCard({ playlist, onDelete }: Props) {
  const count = playlist.streamCount === 1 ? "1 video" : `${playlist.streamCount} videos`;

  return (
    <div className="group flex flex-col gap-2">
      <Link to="/playlist" search={{ url: playlist.url }} className="block">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-strong">
          {playlist.thumbnailUrl && (
            <img
              src={proxyImage(playlist.thumbnailUrl)}
              alt={playlist.title}
              className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
              decoding="async"
            />
          )}
          <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {count}
          </div>
        </div>
      </Link>
      <div className="flex items-start justify-between gap-2 px-1">
        <Link to="/playlist" search={{ url: playlist.url }} className="min-w-0">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-fg group-hover:text-fg-strong">
            {playlist.title}
          </p>
          <p className="mt-1 truncate text-xs text-fg-muted">{playlist.uploaderName}</p>
        </Link>
        <button
          type="button"
          onClick={onDelete}
          aria-label="Remove saved playlist"
          className="mt-0.5 shrink-0 text-fg-soft transition-colors hover:text-danger"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
