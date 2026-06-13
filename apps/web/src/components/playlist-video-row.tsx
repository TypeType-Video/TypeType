import { Link } from "@tanstack/react-router";
import { useWatchPrefetch } from "../hooks/use-watch-prefetch";
import { isVideoWatched } from "../lib/watch-progress";
import { watchRouteSearch } from "../lib/watch-url";
import type { PlaylistVideoItem } from "../types/user";
import { VideoProgressBar } from "./video-progress-bar";
import { WatchedBadge } from "./watched-badge";

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Remove"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

type Props = { video: PlaylistVideoItem; onRemove: () => void };

export function PlaylistVideoRow({ video, onRemove }: Props) {
  const prefetch = useWatchPrefetch(video.url);
  const thumbnail = video.thumbnail.trim().length > 0 ? video.thumbnail : null;
  const watched = video.watched || isVideoWatched(video.watchPosition, video.duration);

  return (
    <div className="flex flex-col gap-2 group relative">
      <Link
        to="/watch"
        search={watchRouteSearch(video.url)}
        className="block"
        onMouseEnter={prefetch.onMouseEnter}
        onMouseLeave={prefetch.onMouseLeave}
      >
        <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-strong">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              loading="lazy"
              decoding="async"
            />
          )}
          {watched && (
            <span className="absolute top-2 left-2">
              <WatchedBadge />
            </span>
          )}
          <VideoProgressBar progress={video.watchPosition} duration={video.duration} />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            aria-label="Remove from playlist"
            className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <XIcon />
          </button>
        </div>
      </Link>
      <Link
        to="/watch"
        search={watchRouteSearch(video.url)}
        onMouseEnter={prefetch.onMouseEnter}
        onMouseLeave={prefetch.onMouseLeave}
      >
        <p className="text-sm font-medium text-fg line-clamp-2 leading-snug group-hover:text-white transition-colors">
          {video.title}
        </p>
      </Link>
    </div>
  );
}
