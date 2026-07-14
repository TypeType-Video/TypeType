import { Link } from "@tanstack/react-router";
import { useDeArrowBranding } from "../hooks/use-dearrow";
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
  const watched = isVideoWatched(item.progress, item.duration);
  const branding = useDeArrowBranding(
    item.url,
    item.title,
    proxyImage(item.thumbnail),
    item.duration,
  );

  return (
    <div
      className="group relative grid animate-card-pop-in grid-cols-[8.75rem_minmax(0,1fr)] gap-3 rounded-2xl border border-border bg-surface/45 p-2.5 sm:flex sm:flex-col sm:gap-2 sm:border-0 sm:bg-transparent sm:p-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Link to="/watch" search={watchRouteSearch(item.url)} className="block min-w-0 sm:w-full">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-strong sm:rounded-lg">
          <img
            src={branding.thumbnail}
            alt={branding.title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
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
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove from history"
            className="absolute top-1.5 right-1.5 rounded-full bg-black/70 p-1.5 text-white opacity-100 transition-opacity hover:bg-black/90 sm:p-1 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <XIcon />
          </button>
        </div>
      </Link>
      <div className="flex min-w-0 gap-2 py-0.5 sm:flex-none sm:py-0">
        {item.channelUrl ? (
          <ChannelRouteLink url={item.channelUrl} className="mt-0.5 hidden flex-shrink-0 sm:block">
            <HistoryChannelAvatar item={item} className="h-7 w-7" />
          </ChannelRouteLink>
        ) : (
          <span className="mt-0.5 hidden flex-shrink-0 sm:block">
            <HistoryChannelAvatar item={item} className="h-7 w-7" />
          </span>
        )}
        <div className="flex min-w-0 flex-col gap-1.5 sm:gap-0.5">
          <Link to="/watch" search={watchRouteSearch(item.url)} className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold leading-snug text-fg sm:font-medium">
              {branding.title}
            </p>
          </Link>
          {item.channelUrl ? (
            <ChannelRouteLink
              url={item.channelUrl}
              className="w-fit max-w-full truncate text-xs text-fg-muted transition-colors hover:text-fg"
            >
              {item.channelName}
            </ChannelRouteLink>
          ) : (
            <p className="truncate text-xs text-fg-muted">{item.channelName}</p>
          )}
          <p className="line-clamp-1 text-[11px] text-fg-soft sm:mt-0">
            Watched {formatWatchedAt(item.watchedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
