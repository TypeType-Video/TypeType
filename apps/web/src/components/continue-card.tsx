import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWatchPrefetch } from "../hooks/use-watch-prefetch";
import { formatDuration } from "../lib/format";
import { resolveHistoryChannelMeta } from "../lib/history-enrichment";
import { proxyImage } from "../lib/proxy";
import { watchRouteSearch } from "../lib/watch-url";
import type { HistoryItem } from "../types/user";
import { ChannelRouteLink } from "./channel-route-link";
import { HistoryChannelAvatar } from "./history-channel-avatar";
import { VideoProgressBar } from "./video-progress-bar";
import { VerifiedBadgeIcon } from "./watch-icons";

type ContinueCardProps = {
  item: HistoryItem;
};

export function ContinueCard({ item }: ContinueCardProps) {
  const prefetch = useWatchPrefetch(item.url);
  const [uploaderVerified, setUploaderVerified] = useState(item.uploaderVerified ?? false);

  useEffect(() => {
    let active = true;
    setUploaderVerified(item.uploaderVerified ?? false);
    if (item.uploaderVerified !== undefined) {
      return () => {
        active = false;
      };
    }
    resolveHistoryChannelMeta(item).then((meta) => {
      if (active) setUploaderVerified(meta.uploaderVerified);
    });
    return () => {
      active = false;
    };
  }, [item]);

  return (
    <div className="w-44 flex-shrink-0">
      <Link
        to="/watch"
        search={watchRouteSearch(item.url)}
        className="group flex flex-col gap-2"
        onMouseEnter={prefetch.onMouseEnter}
        onMouseLeave={prefetch.onMouseLeave}
      >
        <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-strong">
          <img
            src={proxyImage(item.thumbnail)}
            alt={item.title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-medium text-white">
            {formatDuration(item.duration)}
          </span>
          <VideoProgressBar progress={item.progress} duration={item.duration} />
        </div>
        <span className="line-clamp-2 text-fg text-xs leading-snug group-hover:text-white">
          {item.title}
        </span>
      </Link>
      <div className="mt-1.5 flex min-w-0 items-center gap-1.5">
        {item.channelUrl ? (
          <ChannelRouteLink url={item.channelUrl} className="flex-shrink-0">
            <HistoryChannelAvatar item={item} className="h-5 w-5" />
          </ChannelRouteLink>
        ) : (
          <HistoryChannelAvatar item={item} className="h-5 w-5" />
        )}
        {item.channelUrl ? (
          <ChannelRouteLink
            url={item.channelUrl}
            className="flex min-w-0 items-center gap-1 text-[10px] text-fg-soft transition-colors hover:text-fg"
          >
            <span className="min-w-0 truncate">{item.channelName}</span>
            {uploaderVerified && <VerifiedBadgeIcon />}
          </ChannelRouteLink>
        ) : (
          <span className="flex min-w-0 items-center gap-1 text-[10px] text-fg-soft">
            <span className="min-w-0 truncate">{item.channelName}</span>
            {uploaderVerified && <VerifiedBadgeIcon />}
          </span>
        )}
      </div>
    </div>
  );
}
