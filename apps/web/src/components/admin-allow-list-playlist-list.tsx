import { Link } from "@tanstack/react-router";
import { proxyImage } from "../lib/proxy";
import type { AllowedPlaylistItem } from "../types/allow-list";

type Props = {
  title: string;
  playlists: AllowedPlaylistItem[];
  onRemove?: (url: string) => void;
};

function playlistPath(url: string): string {
  const params = new URLSearchParams({ url });
  return `/playlist?${params.toString()}`;
}

function XIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function AdminAllowListPlaylistList({ title, playlists, onRemove }: Props) {
  return (
    <section className="min-w-0 border-t border-border pt-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        <span className="text-xs text-fg-soft">
          {playlists.length} {playlists.length === 1 ? "playlist" : "playlists"}
        </span>
      </div>
      {playlists.length === 0 ? (
        <p className="py-3 text-sm text-fg-soft">No playlists added.</p>
      ) : (
        <div className="border-y border-border">
          {playlists.map((playlist) => {
            const label = playlist.title ?? playlist.url;
            return (
              <div
                key={playlist.url}
                className="flex min-w-0 items-center gap-3 border-b border-border px-0 py-3 last:border-b-0"
              >
                <img
                  src={proxyImage(playlist.thumbnailUrl ?? "")}
                  alt=""
                  className="h-10 w-16 shrink-0 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/playlist"
                    search={{ list: undefined, url: playlist.url }}
                    className="block truncate text-sm font-medium text-fg hover:underline"
                  >
                    {label}
                  </Link>
                  <Link
                    to="/playlist"
                    search={{ list: undefined, url: playlist.url }}
                    className="block truncate text-xs text-fg-soft hover:text-fg-muted"
                  >
                    {playlistPath(playlist.url)}
                  </Link>
                </div>
                {onRemove && (
                  <button
                    type="button"
                    onClick={() => onRemove(playlist.url)}
                    aria-label={`Remove ${label}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center text-fg-soft transition-colors hover:text-fg"
                  >
                    <XIcon />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
