import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useClientLocale } from "../hooks/use-client-locale";
import { isMemberOnlyApiError, streamQueryOptions } from "../hooks/use-stream";
import { useWatchPrefetch } from "../hooks/use-watch-prefetch";
import { formatDuration, formatPublishedDate, formatViews } from "../lib/format";
import { watchRouteSearch } from "../lib/watch-url";
import type { VideoStream } from "../types/stream";
import { ChannelAvatar } from "./channel-avatar";
import { ChannelRouteLink } from "./channel-route-link";
import { VideoCardFeedbackMenu } from "./video-card-feedback-menu";
import { VideoPreview } from "./video-preview";
import { VerifiedBadgeIcon } from "./watch-icons";

type Props = { stream: VideoStream; onOpen?: () => void; onImpression?: () => void };

export function VideoCard({ stream, onOpen, onImpression }: Props) {
  const locale = useClientLocale();
  const queryClient = useQueryClient();
  const rootRef = useRef<HTMLElement | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [previewStream, setPreviewStream] = useState<VideoStream | undefined>(undefined);
  const [showPreview, setShowPreview] = useState(false);
  const [memberOnly, setMemberOnly] = useState(false);
  const prefetch = useWatchPrefetch(stream.id);
  const publishedText = formatPublishedDate(stream.publishedAt, undefined, locale);

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

  const fetchStreamData = useCallback(async () => {
    const cached = queryClient.getQueryData<VideoStream>(["stream", stream.id]);
    if (cached?.videoOnlyStreams?.length) {
      setMemberOnly(false);
      setPreviewStream(cached);
      return;
    }
    try {
      const data = await queryClient.fetchQuery(streamQueryOptions(stream.id));
      setMemberOnly(Boolean(data.requiresMembership));
      if (data?.videoOnlyStreams?.length) setPreviewStream(data);
    } catch (error) {
      if (isMemberOnlyApiError(error)) {
        setMemberOnly(true);
      }
    }
  }, [queryClient, stream.id]);

  const handleMouseEnter = () => {
    prefetch.onMouseEnter();
    previewTimer.current = setTimeout(() => {
      void fetchStreamData().then(() => setShowPreview(true));
    }, 5000);
  };

  const handleMouseLeave = () => {
    prefetch.onMouseLeave();
    if (previewTimer.current) {
      clearTimeout(previewTimer.current);
      previewTimer.current = null;
    }
    setShowPreview(false);
  };

  const isMemberOnly = memberOnly || stream.requiresMembership === true;

  return (
    <article
      ref={rootRef}
      className="group flex flex-col gap-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        to="/watch"
        search={watchRouteSearch(stream.id)}
        className="block"
        onMouseDown={onOpen}
        onTouchStart={onOpen}
        onClick={onOpen}
      >
        <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-strong sm:rounded-lg">
          <img
            src={stream.thumbnail}
            alt={stream.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
            decoding="async"
          />
          <VideoPreview stream={previewStream} show={showPreview} />
          {isMemberOnly && (
            <span className="absolute left-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-black">
              Members only
            </span>
          )}
          {stream.duration > 0 && (
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
            search={watchRouteSearch(stream.id)}
            className="text-sm font-medium text-fg line-clamp-2 leading-snug hover:text-white"
            onMouseDown={onOpen}
            onTouchStart={onOpen}
            onClick={onOpen}
          >
            {stream.title}
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
