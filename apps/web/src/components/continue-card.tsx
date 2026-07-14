import { Link } from "@tanstack/react-router";
import { useClientLocale } from "../hooks/use-client-locale";
import { useDeArrowBranding } from "../hooks/use-dearrow";
import { formatDuration, formatPublishedDate, formatViews } from "../lib/format";
import { proxyImage } from "../lib/proxy";
import { watchRouteSearch } from "../lib/watch-url";
import { useWatchNavigationStore } from "../stores/watch-navigation-store";
import type { VideoStream } from "../types/stream";
import type { HistoryItem } from "../types/user";
import { ChannelRouteLink } from "./channel-route-link";
import { HistoryChannelAvatar } from "./history-channel-avatar";
import { VideoCardFeedbackMenu } from "./video-card-feedback-menu";
import { VideoProgressBar } from "./video-progress-bar";
import { VerifiedBadgeIcon } from "./watch-icons";

type ContinueCardProps = {
  item: HistoryItem;
};

export function ContinueCard({ item }: ContinueCardProps) {
  const locale = useClientLocale();
  const setNavigation = useWatchNavigationStore((state) => state.setNavigation);
  const uploaderVerified = item.uploaderVerified ?? false;
  const branding = useDeArrowBranding(
    item.url,
    item.title,
    proxyImage(item.thumbnail),
    item.duration,
  );
  const thumbnail = branding.thumbnail;
  const publishedText = formatPublishedDate(item.publishedAt, undefined, locale);
  const viewsText = item.viewCount === undefined ? "" : formatViews(item.viewCount);
  const metaText = [viewsText, publishedText].filter(Boolean).join(" · ");
  const menuStream: VideoStream = {
    id: item.url,
    title: item.title,
    thumbnail,
    rawThumbnail: item.thumbnail,
    rawChannelAvatar: item.channelAvatar ?? "",
    channelName: item.channelName,
    channelUrl: item.channelUrl || undefined,
    channelAvatar: proxyImage(item.channelAvatar ?? ""),
    uploaderVerified,
    views: item.viewCount ?? 0,
    duration: item.duration,
    publishedAt: item.publishedAt,
  };

  return (
    <div className="w-56 flex-shrink-0">
      <Link
        to="/watch"
        search={watchRouteSearch(item.url)}
        preload="intent"
        className="group flex flex-col gap-2"
        onClick={() => setNavigation(menuStream)}
      >
        <div className="relative aspect-video overflow-hidden rounded-lg bg-surface-strong">
          <img
            src={thumbnail}
            alt={branding.title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1 py-0.5 text-[10px] font-medium text-white">
            {formatDuration(item.duration)}
          </span>
          <VideoProgressBar progress={item.progress} duration={item.duration} />
        </div>
        <span className="line-clamp-2 text-fg text-sm leading-snug group-hover:text-fg-strong">
          {branding.title}
        </span>
      </Link>
      <div className="mt-2 flex min-w-0 items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {item.channelUrl ? (
            <ChannelRouteLink url={item.channelUrl} className="flex-shrink-0">
              <HistoryChannelAvatar item={item} className="h-7 w-7" />
            </ChannelRouteLink>
          ) : (
            <HistoryChannelAvatar item={item} className="h-7 w-7" />
          )}
          <div className="flex min-w-0 flex-col">
            {item.channelUrl ? (
              <ChannelRouteLink
                url={item.channelUrl}
                className="flex min-w-0 items-center gap-1 text-xs text-fg-soft transition-colors hover:text-fg"
              >
                <span className="min-w-0 truncate">{item.channelName}</span>
                {uploaderVerified && <VerifiedBadgeIcon />}
              </ChannelRouteLink>
            ) : (
              <span className="flex min-w-0 items-center gap-1 text-xs text-fg-soft">
                <span className="min-w-0 truncate">{item.channelName}</span>
                {uploaderVerified && <VerifiedBadgeIcon />}
              </span>
            )}
            {metaText && <span className="text-xs text-fg-soft">{metaText}</span>}
          </div>
        </div>
        <VideoCardFeedbackMenu stream={menuStream} />
      </div>
    </div>
  );
}
