import { Link } from "@tanstack/react-router";
import { memo, useCallback, useEffect, useRef } from "react";
import { useClientLocale } from "../hooks/use-client-locale";
import { useDeArrowBranding } from "../hooks/use-dearrow";
import { useVideoCardPreview } from "../hooks/use-video-card-preview";
import { formatDuration, formatPublishedDate, formatViews } from "../lib/format";
import { watchListSearch } from "../lib/watch-url";
import { useWatchNavigationStore } from "../stores/watch-navigation-store";
import type { VideoStream } from "../types/stream";
import { ChannelAvatar } from "./channel-avatar";
import { ChannelRouteLink } from "./channel-route-link";
import { VideoCardFeedbackMenu } from "./video-card-feedback-menu";
import { VideoPreview } from "./video-preview";
import { VideoStatusBadge } from "./video-status-badge";
import { VerifiedBadgeIcon } from "./watch-icons";

type Props = {
  stream: VideoStream;
  onOpen?: () => void;
  onImpression?: () => void;
  listId?: string;
  relatedStreams?: VideoStream[];
};

function VideoCardComponent({ stream, onOpen, onImpression, listId, relatedStreams }: Props) {
  const locale = useClientLocale();
  const rootRef = useRef<HTMLElement | null>(null);
  const setNavigation = useWatchNavigationStore((state) => state.setNavigation);
  const preview = useVideoCardPreview(stream);
  const { title, thumbnail } = useDeArrowBranding(
    stream.id,
    stream.title,
    stream.thumbnail,
    stream.duration,
  );
  const publishedText = formatPublishedDate(stream.publishedAt, undefined, locale);
  const watchSearch = watchListSearch(stream.id, listId);
  const handleOpen = useCallback(() => {
    setNavigation(stream, relatedStreams);
    onOpen?.();
  }, [onOpen, relatedStreams, setNavigation, stream]);

  useEffect(() => {
    if (!onImpression || typeof IntersectionObserver === "undefined") return;
    const element = rootRef.current;
    if (!element) return;
    let seen = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (seen || !entry.isIntersecting || entry.intersectionRatio < 0.6) continue;
          seen = true;
          onImpression();
          observer.disconnect();
        }
      },
      { threshold: [0.6] },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [onImpression]);

  return (
    <article
      ref={rootRef}
      className="group flex flex-col gap-2"
      onMouseEnter={preview.onMouseEnter}
      onMouseLeave={preview.onMouseLeave}
    >
      <Link
        to="/watch"
        search={watchSearch}
        preload="intent"
        className="block"
        onMouseDown={handleOpen}
        onTouchStart={handleOpen}
        onClick={handleOpen}
      >
        <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-strong sm:rounded-lg">
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            decoding="async"
          />
          <VideoPreview stream={preview.previewStream} show={preview.showPreview} />
          {preview.memberOnly && (
            <span className="absolute left-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-black">
              Members only
            </span>
          )}
          {(stream.isLive || stream.isPostLive) && (
            <span className="absolute bottom-1.5 left-1.5">
              <VideoStatusBadge stream={stream} />
            </span>
          )}
          {!stream.isLive && stream.duration > 0 && (
            <span className="absolute bottom-1.5 right-1.5 bg-black/80 text-white text-xs px-1 rounded">
              {formatDuration(stream.duration)}
            </span>
          )}
        </div>
      </Link>
      <div className="flex gap-2 px-1 sm:px-0">
        {stream.channelUrl ? (
          <ChannelRouteLink url={stream.channelUrl} className="flex-shrink-0 mt-0.5">
            <ChannelAvatar
              src={stream.channelAvatar}
              name={stream.channelName}
              className="w-8 h-8"
            />
          </ChannelRouteLink>
        ) : (
          <ChannelAvatar src={stream.channelAvatar} name={stream.channelName} className="w-8 h-8" />
        )}
        <div className="flex flex-col gap-0.5 min-w-0">
          <Link
            to="/watch"
            search={watchSearch}
            preload="intent"
            className="text-sm font-medium text-fg line-clamp-2 leading-snug hover:text-fg-strong"
            onMouseDown={handleOpen}
            onTouchStart={handleOpen}
            onClick={handleOpen}
          >
            {title}
          </Link>
          {stream.channelUrl ? (
            <ChannelRouteLink
              url={stream.channelUrl}
              className="text-xs text-fg-muted hover:text-fg transition-colors w-fit flex items-center gap-1"
            >
              {stream.channelName}
              {stream.uploaderVerified && <VerifiedBadgeIcon />}
            </ChannelRouteLink>
          ) : (
            <p className="text-xs text-fg-muted flex items-center gap-1">
              {stream.channelName}
              {stream.uploaderVerified && <VerifiedBadgeIcon />}
            </p>
          )}
          <p className="text-xs text-fg-soft">
            {formatViews(stream.views)}
            {publishedText && ` · ${publishedText}`}
          </p>
        </div>
        <VideoCardFeedbackMenu stream={stream} />
      </div>
    </article>
  );
}

export const VideoCard = memo(VideoCardComponent);
