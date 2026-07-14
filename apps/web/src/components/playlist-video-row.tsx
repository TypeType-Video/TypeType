import { Link } from "@tanstack/react-router";
import { GripVertical } from "lucide-react";
import type { DragEvent } from "react";
import { useDeArrowBranding } from "../hooks/use-dearrow";
import { formatDuration, formatViews } from "../lib/format";
import { proxyImage } from "../lib/proxy";
import { isVideoWatched } from "../lib/watch-progress";
import { watchRouteSearch } from "../lib/watch-url";
import type { VideoStream } from "../types/stream";
import type { PlaylistVideoItem } from "../types/user";
import { ChannelRouteLink } from "./channel-route-link";
import { VideoCardFeedbackMenu } from "./video-card-feedback-menu";
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

type Props = {
  video: PlaylistVideoItem;
  onRemove: () => void;
  reorderable?: boolean;
  listId?: string;
  onDragStart?: (event: DragEvent) => void;
};

export function PlaylistVideoRow({ video, onRemove, reorderable, listId, onDragStart }: Props) {
  const rawThumbnail = video.thumbnail.trim();
  const fallbackThumbnail = rawThumbnail.length > 0 ? proxyImage(rawThumbnail) : "";
  const branding = useDeArrowBranding(video.url, video.title, fallbackThumbnail, video.duration);
  const thumbnail = branding.thumbnail || null;
  const watched = video.watched || isVideoWatched(video.watchPosition, video.duration);
  const rawChannelName = video.channelName?.trim() ?? "";
  const rawChannelUrl = video.channelUrl?.trim() ?? "";
  const rawChannelAvatar = video.channelAvatar?.trim() ?? "";
  const rawViews = video.viewCount ?? 0;
  const channelName = rawChannelName;
  const channelUrl = rawChannelUrl;
  const channelAvatar = rawChannelAvatar;
  const views = rawViews;
  const menuStream: VideoStream = {
    id: video.url,
    title: video.title,
    thumbnail: thumbnail ?? "",
    rawThumbnail,
    rawChannelAvatar: rawChannelAvatar,
    channelName,
    channelUrl: channelUrl || undefined,
    channelAvatar,
    views,
    duration: video.duration,
  };
  const watchSearch = listId
    ? { ...watchRouteSearch(video.url), list: listId }
    : watchRouteSearch(video.url);

  return (
    <div className="flex flex-col gap-2 group relative">
      <Link to="/watch" search={watchSearch} className="block">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-strong">
          {thumbnail && (
            <img
              src={thumbnail}
              alt={branding.title}
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
          {video.duration > 0 && (
            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1 py-0.5 text-[10px] font-medium text-white">
              {formatDuration(video.duration)}
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
          {reorderable && (
            <button
              type="button"
              draggable
              onDragStart={onDragStart}
              onClick={(e) => e.preventDefault()}
              aria-label="Drag to reorder"
              className="absolute top-1.5 left-1.5 cursor-grab bg-black/70 p-1 text-white opacity-0 transition-opacity hover:bg-black/90 active:cursor-grabbing group-hover:opacity-100"
            >
              <GripVertical className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      </Link>
      <Link to="/watch" search={watchSearch}>
        <p className="text-sm font-medium text-fg line-clamp-2 leading-snug group-hover:text-fg-strong transition-colors">
          {branding.title}
        </p>
      </Link>
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          {channelName.length > 0 &&
            (channelUrl.length > 0 ? (
              <ChannelRouteLink
                url={channelUrl}
                className="w-fit max-w-full truncate text-xs text-fg-muted transition-colors hover:text-fg"
              >
                {channelName}
              </ChannelRouteLink>
            ) : (
              <p className="truncate text-xs text-fg-muted">{channelName}</p>
            ))}
          {views > 0 && <p className="text-xs text-fg-soft">{formatViews(views)}</p>}
        </div>
        <VideoCardFeedbackMenu stream={menuStream} />
      </div>
    </div>
  );
}
