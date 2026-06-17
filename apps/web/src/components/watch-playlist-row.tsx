import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import type { DragEvent } from "react";
import { proxyImage } from "../lib/proxy";
import { toPublicWatchParam } from "../lib/watch-url";
import type { WatchPlaylistItem } from "../types/playlist";
import { WatchPlaylistHandle } from "./watch-playlist-handle";

type Props = {
  video: WatchPlaylistItem;
  index: number;
  total: number;
  isCurrent: boolean;
  reorderable: boolean;
  isMobile: boolean;
  listId: string;
  shuffle: string | undefined;
  onDragStart: (event: DragEvent) => void;
  onMove: (direction: number) => void;
};

export function WatchPlaylistRow({
  video,
  index,
  total,
  isCurrent,
  reorderable,
  isMobile,
  listId,
  shuffle,
  onDragStart,
  onMove,
}: Props) {
  return (
    <>
      <WatchPlaylistHandle
        reorderable={reorderable}
        isMobile={isMobile}
        index={index}
        total={total}
        onDragStart={onDragStart}
        onMove={onMove}
      />
      <Link
        to="/watch"
        search={{
          v: toPublicWatchParam(video.url),
          list: listId,
          ...(shuffle ? { shuffle } : {}),
        }}
        className="flex min-w-0 flex-1 items-center gap-2 py-1.5"
      >
        <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded bg-surface-strong">
          {video.thumbnail && (
            <img
              src={proxyImage(video.thumbnail)}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
          {isCurrent && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Play className="h-4 w-4 fill-white text-white" aria-hidden="true" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={`line-clamp-2 text-xs leading-snug ${
              isCurrent ? "font-medium text-fg" : "text-fg-muted"
            }`}
          >
            {video.title}
          </p>
          {video.channelName && (
            <p className="mt-0.5 truncate text-[11px] text-fg-soft">{video.channelName}</p>
          )}
        </div>
      </Link>
    </>
  );
}
