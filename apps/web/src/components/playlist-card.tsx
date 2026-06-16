import { Link } from "@tanstack/react-router";
import type { PlaylistItem } from "../types/playlist";

type Props = {
  playlist: PlaylistItem;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onDeleteRequest: () => void;
};

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Delete"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function EmptyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={32}
      height={32}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Empty playlist"
      className="text-fg-soft"
    >
      <path d="M3 5h15" />
      <path d="M3 9h15" />
      <path d="M3 13h9" />
      <path d="M15 13l4 3-4 3V13z" />
    </svg>
  );
}

function ThumbnailContent({ playlist }: { playlist: PlaylistItem }) {
  const thumbnail = playlist.videos[0]?.thumbnail;
  const count = playlist.videos.length;
  const label = `${count} video${count !== 1 ? "s" : ""}`;
  return (
    <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-strong">
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={playlist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <EmptyIcon />
        </div>
      )}
      <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
        {label}
      </span>
    </div>
  );
}

export function PlaylistCard({
  playlist,
  selectionMode,
  selected,
  onToggleSelect,
  onDeleteRequest,
}: Props) {
  const count = playlist.videos.length;
  const label = `${count} video${count !== 1 ? "s" : ""}`;

  return (
    <div className="flex flex-col gap-2 group">
      <div className="relative">
        {selectionMode ? (
          <button
            type="button"
            className="w-full"
            onClick={onToggleSelect}
            aria-label={`${selected ? "Deselect" : "Select"} ${playlist.name}`}
          >
            <ThumbnailContent playlist={playlist} />
            <div
              className={`absolute inset-0 rounded-xl border-2 transition-colors ${selected ? "border-fg bg-fg/10" : "border-transparent"}`}
            />
            <div
              className={`absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selected ? "bg-fg border-fg" : "bg-black/50 border-border-strong"}`}
            >
              {selected && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={10}
                  height={10}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="text-app"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </button>
        ) : (
          <Link to="/playlists/$id" params={{ id: playlist.id }}>
            <ThumbnailContent playlist={playlist} />
          </Link>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <Link
          to="/playlists/$id"
          params={{ id: playlist.id }}
          className="min-w-0"
          onClick={(e) => selectionMode && e.preventDefault()}
        >
          <p className="text-sm font-medium text-fg truncate group-hover:text-fg-strong transition-colors">
            {playlist.name}
          </p>
          <p className="text-xs text-fg-soft">{label}</p>
        </Link>
        {!selectionMode && (
          <button
            type="button"
            onClick={onDeleteRequest}
            aria-label="Delete playlist"
            className="text-fg-soft hover:text-danger transition-colors flex-shrink-0 mt-0.5"
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}
