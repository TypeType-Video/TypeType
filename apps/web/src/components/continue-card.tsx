import { Link } from "@tanstack/react-router";
import { useWatchPrefetch } from "../hooks/use-watch-prefetch";
import { formatDuration } from "../lib/format";
import type { HistoryItem } from "../types/user";
import { VideoProgressBar } from "./video-progress-bar";

type ContinueCardProps = {
  item: HistoryItem;
};

export function ContinueCard({ item }: ContinueCardProps) {
  const prefetch = useWatchPrefetch(item.url);

  return (
    <Link
      to="/watch"
      search={{ v: item.url }}
      className="flex-shrink-0 w-44 flex flex-col gap-2 group"
      onMouseEnter={prefetch.onMouseEnter}
      onMouseLeave={prefetch.onMouseLeave}
    >
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-strong">
        <img
          src={item.thumbnail}
          alt={item.title}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded">
          {formatDuration(item.duration)}
        </span>
        <VideoProgressBar progress={item.progress} duration={item.duration} />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-fg line-clamp-2 leading-snug group-hover:text-white">
          {item.title}
        </span>
        <span className="text-[10px] text-fg-soft truncate">{item.channelName}</span>
      </div>
    </Link>
  );
}
