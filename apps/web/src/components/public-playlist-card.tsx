import { Link } from "@tanstack/react-router";
import { playlistListId } from "../lib/playlist-url";
import { proxyImage } from "../lib/proxy";
import type { PublicPlaylistInfo } from "../types/playlist";

type Props = {
  playlist: PublicPlaylistInfo;
};

export function PublicPlaylistCard({ playlist }: Props) {
  const list = playlistListId(playlist.url);
  if (!list) return null;
  const count = playlist.streamCount === 1 ? "1 video" : `${playlist.streamCount} videos`;

  return (
    <Link to="/playlist" search={{ list }} className="group flex flex-col gap-2">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-strong">
        <img
          src={proxyImage(playlist.thumbnailUrl)}
          alt={playlist.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute bottom-1.5 right-1.5 rounded-md bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {count}
        </div>
      </div>
      <div className="min-w-0 px-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-fg group-hover:text-white">
          {playlist.title}
        </p>
        <p className="mt-1 truncate text-xs text-fg-muted">{playlist.uploaderName}</p>
      </div>
    </Link>
  );
}
