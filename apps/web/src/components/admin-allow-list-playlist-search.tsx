import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { fetchSearch } from "../lib/api-discovery";
import { proxyImage } from "../lib/proxy";
import type { AllowPlaylistInput } from "../types/allow-list";
import type { PublicPlaylistInfo } from "../types/playlist";

type Props = {
  title: string;
  description: string;
  addedUrls: string[];
  pending: boolean;
  onAdd: (playlist: AllowPlaylistInput) => void;
};

function playlistPath(url: string): string {
  const params = new URLSearchParams({ url });
  return `/playlist?${params.toString()}`;
}

function playlistSourceUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) return "";
  try {
    const parsed = new URL(trimmed, "http://typetype.local");
    const sourceUrl = parsed.pathname === "/playlist" ? parsed.searchParams.get("url") : null;
    return sourceUrl?.trim() || trimmed;
  } catch {
    return trimmed;
  }
}

export function AdminAllowListPlaylistSearch({
  title,
  description,
  addedUrls,
  pending,
  onAdd,
}: Props) {
  const [term, setTerm] = useState("");
  const [url, setUrl] = useState("");
  const debounced = useDebouncedValue(term.trim(), 300);
  const added = new Set(addedUrls);
  const search = useQuery({
    queryKey: ["admin-allow-list-playlist-search", debounced],
    queryFn: () => fetchSearch(debounced, 0),
    enabled: debounced.length >= 2,
    staleTime: 60 * 1000,
  });
  const playlists = search.data?.playlists ?? [];
  const playlistUrl = playlistSourceUrl(url);
  const urlAlreadyAdded = added.has(playlistUrl);

  function addUrl() {
    if (playlistUrl.length === 0 || urlAlreadyAdded || pending) return;
    onAdd({ url: playlistUrl, title: null, thumbnailUrl: null, uploaderName: null });
    setUrl("");
  }

  function addPlaylist(playlist: PublicPlaylistInfo) {
    onAdd({
      url: playlist.url,
      title: playlist.title,
      thumbnailUrl: playlist.thumbnailUrl,
      uploaderName: playlist.uploaderName,
    });
  }

  return (
    <section className="min-w-0 border-t border-border pt-4">
      <div className="mb-3 flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        <p className="text-xs text-fg-soft">{description}</p>
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Playlist URL"
          className="h-10 flex-1 border border-border bg-app px-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-border-strong"
        />
        <button
          type="button"
          disabled={playlistUrl.length === 0 || urlAlreadyAdded || pending}
          onClick={addUrl}
          className="h-10 border border-border px-4 text-sm font-medium text-fg transition-colors hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {urlAlreadyAdded ? "Added" : "Add URL"}
        </button>
      </div>
      <input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Playlist name"
        className="h-10 w-full border border-border bg-app px-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-border-strong"
      />
      <div className="mt-3 border-y border-border">
        {debounced.length < 2 ? (
          <div className="px-4 py-5 text-sm text-fg-soft">Type at least two characters.</div>
        ) : search.isLoading ? (
          <div className="px-4 py-5 text-sm text-fg-soft">Searching playlists...</div>
        ) : playlists.length === 0 ? (
          <div className="px-4 py-5 text-sm text-fg-soft">No playlists found.</div>
        ) : (
          <div className="divide-y divide-border">
            {playlists.slice(0, 8).map((playlist) => {
              const alreadyAdded = added.has(playlist.url);
              return (
                <div key={playlist.url} className="flex min-w-0 items-center gap-3 px-3 py-2.5">
                  <img
                    src={proxyImage(playlist.thumbnailUrl)}
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
                      {playlist.title}
                    </Link>
                    <p className="truncate text-xs text-fg-soft">{playlistPath(playlist.url)}</p>
                  </div>
                  <button
                    type="button"
                    disabled={alreadyAdded || pending}
                    onClick={() => addPlaylist(playlist)}
                    className={`h-8 shrink-0 border px-3 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      alreadyAdded
                        ? "border-border text-fg-soft"
                        : "border-fg bg-fg text-app hover:bg-fg-strong"
                    }`}
                  >
                    {alreadyAdded ? "Added" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
