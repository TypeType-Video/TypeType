import { Link } from "@tanstack/react-router";
import { useWatchPrefetch } from "../hooks/use-watch-prefetch";
import { formatDuration } from "../lib/format";
import { proxyImage } from "../lib/proxy";
import { isVideoWatched } from "../lib/watch-progress";
import { watchRouteSearch } from "../lib/watch-url";
import type { HistoryItem } from "../types/user";
import { ChannelRouteLink } from "./channel-route-link";
import { HistoryChannelAvatar } from "./history-channel-avatar";
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

type HistoryCardProps = { item: HistoryItem; onRemove: () => void; index: number };

function formatWatchedAt(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function HistoryCard({ item, onRemove, index }: HistoryCardProps) {
  const delay = Math.min(index * 45, 270);
  const prefetch = useWatchPrefetch(item.url);
  const watched = isVideoWatched(item.progress, item.duration);

  return (
    <div
      className="flex flex-col gap-2 group relative animate-card-pop-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Link
        to="/watch"
        search={watchRouteSearch(item.url)}
        className="block"
        onMouseEnter={prefetch.onMouseEnter}
        onMouseLeave={prefetch.onMouseLeave}
      >
        <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-strong">
          <img
            src={proxyImage(item.thumbnail)}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            decoding="async"
          />
          {item.duration > 0 && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1 rounded">
              {formatDuration(item.duration)}
            </span>
          )}
          {watched && (
            <span className="absolute top-2 left-2">
              <WatchedBadge />
            </span>
          )}
          <VideoProgressBar progress={item.progress} duration={item.duration} alwaysVisible />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onRemove();
            }}
            aria-label="Remove from history"
            className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-black/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <XIcon />
          </button>
        </div>
      </Link>
      <div className="flex gap-2">
        {item.channelUrl ? (
          <ChannelRouteLink url={item.channelUrl} className="flex-shrink-0 mt-0.5">
            <HistoryChannelAvatar item={item} className="w-7 h-7" />
          </ChannelRouteLink>
        ) : (
          <HistoryChannelAvatar item={item} className="w-7 h-7" />
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          <Link
            to="/watch"
            search={watchRouteSearch(item.url)}
            onMouseEnter={prefetch.onMouseEnter}
            onMouseLeave={prefetch.onMouseLeave}
          >
            <p className="text-sm font-medium text-fg line-clamp-2 leading-snug">{item.title}</p>
          </Link>
          {item.channelUrl ? (
            <ChannelRouteLink
              url={item.channelUrl}
              className="text-xs text-fg-muted hover:text-fg transition-colors w-fit"
            >
              {item.channelName}
            </ChannelRouteLink>
          ) : (
            <p className="text-xs text-fg-muted">{item.channelName}</p>
          )}
          <p className="text-[11px] text-fg-soft">Watched {formatWatchedAt(item.watchedAt)}</p>
        </div>
      </div>
    </div>
  );
}
