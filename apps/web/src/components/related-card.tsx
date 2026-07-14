import { Link } from "@tanstack/react-router";
import { memo } from "react";
import { useClientLocale } from "../hooks/use-client-locale";
import { useDeArrowBranding } from "../hooks/use-dearrow";
import { formatDuration, formatPublishedDate, formatViews } from "../lib/format";
import { watchRouteSearch } from "../lib/watch-url";
import { useWatchNavigationStore } from "../stores/watch-navigation-store";
import type { VideoStream } from "../types/stream";
import { ChannelAvatar } from "./channel-avatar";
import { ChannelRouteLink } from "./channel-route-link";
import { VideoCardFeedbackMenu } from "./video-card-feedback-menu";
import { VideoStatusBadge } from "./video-status-badge";
import { VerifiedBadgeIcon } from "./watch-icons";

type Props = {
  stream: VideoStream;
  relatedStreams?: VideoStream[];
};

function RelatedCardComponent({ stream, relatedStreams }: Props) {
  const locale = useClientLocale();
  const setNavigation = useWatchNavigationStore((state) => state.setNavigation);
  const { title, thumbnail } = useDeArrowBranding(
    stream.id,
    stream.title,
    stream.thumbnail,
    stream.duration,
  );
  const publishedText = formatPublishedDate(stream.publishedAt, undefined, locale);
  const metadata = [formatViews(stream.views), publishedText].filter(Boolean).join(" · ");

  return (
    <article className="flex gap-2 group">
      <Link
        to="/watch"
        search={watchRouteSearch(stream.id)}
        preload="intent"
        className="relative w-40 aspect-video rounded-md overflow-hidden bg-surface-strong flex-shrink-0"
        onClick={() => setNavigation(stream, relatedStreams)}
      >
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          loading="lazy"
          decoding="async"
        />
        {stream.requiresMembership && (
          <span className="absolute left-1 top-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-black">
            Members only
          </span>
        )}
        {(stream.isLive || stream.isPostLive) && (
          <span className="absolute bottom-1 left-1">
            <VideoStatusBadge stream={stream} compact />
          </span>
        )}
        {!stream.isLive && stream.duration > 0 && (
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
            {formatDuration(stream.duration)}
          </span>
        )}
      </Link>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <Link
          to="/watch"
          search={watchRouteSearch(stream.id)}
          preload="intent"
          className="text-xs font-medium text-fg line-clamp-2 leading-snug hover:text-fg-strong"
          onClick={() => setNavigation(stream, relatedStreams)}
        >
          {title}
        </Link>
        {stream.channelUrl ? (
          <ChannelRouteLink
            url={stream.channelUrl}
            className="flex items-center gap-1.5 mt-0.5 w-fit group/channel"
          >
            <ChannelAvatar
              src={stream.channelAvatar}
              name={stream.channelName}
              className="w-4 h-4"
            />
            <span className="text-xs text-fg-muted group-hover/channel:text-fg truncate flex items-center gap-1">
              {stream.channelName}
              {stream.uploaderVerified && <VerifiedBadgeIcon />}
            </span>
          </ChannelRouteLink>
        ) : (
          <div className="flex items-center gap-1.5 mt-0.5">
            <ChannelAvatar
              src={stream.channelAvatar}
              name={stream.channelName}
              className="w-4 h-4"
            />
            <span className="text-xs text-fg-muted truncate flex items-center gap-1">
              {stream.channelName}
              {stream.uploaderVerified && <VerifiedBadgeIcon />}
            </span>
          </div>
        )}
        <p className="text-xs text-fg-soft">{metadata}</p>
      </div>
      <VideoCardFeedbackMenu stream={stream} />
    </article>
  );
}

export const RelatedCard = memo(RelatedCardComponent);
