import type { SavedPlaylistItem } from "../types/playlist";
import { SavedPlaylistCard } from "./saved-playlist-card";

type Props = {
  playlists: SavedPlaylistItem[];
  onDelete: (playlist: SavedPlaylistItem) => void;
};

export function SavedPlaylistsSection({ playlists, onDelete }: Props) {
  if (playlists.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-semibold text-fg">Saved public playlists</h2>
        <p className="text-xs text-fg-soft">Live public playlists saved to your library.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {playlists.map((playlist, index) => (
          <div
            key={playlist.id}
            className="animate-card-pop-in"
            style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
          >
            <SavedPlaylistCard playlist={playlist} onDelete={() => onDelete(playlist)} />
          </div>
        ))}
      </div>
    </section>
  );
}
