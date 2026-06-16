import { Link } from "@tanstack/react-router";
import { ChevronDown, Play, Shuffle } from "lucide-react";
import { type DragEvent, useState } from "react";
import { useMobile } from "../hooks/use-mobile";
import { proxyImage } from "../lib/proxy";
import { toPublicWatchParam } from "../lib/watch-url";
import type { PlaylistItem } from "../types/user";
import { WatchPlaylistHandle } from "./watch-playlist-handle";

type Props = {
  playlist: PlaylistItem;
  listId: string;
  currentParam: string;
  shuffle: boolean;
  onToggleShuffle: () => void;
  onReorder?: (order: string[]) => void;
};

export function WatchPlaylistPanel({
  playlist,
  listId,
  currentParam,
  shuffle,
  onToggleShuffle,
  onReorder,
}: Props) {
  const isMobile = useMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const videos = playlist.videos;
  const currentIndex = videos.findIndex((video) => toPublicWatchParam(video.url) === currentParam);
  const reorderable = Boolean(onReorder);

  function handleDragStart(event: DragEvent, index: number) {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    const row = (event.currentTarget as HTMLElement).closest("[data-pl-row]");
    if (row instanceof HTMLElement) event.dataTransfer.setDragImage(row, 20, 20);
  }

  function handleDrop(targetIndex: number) {
    if (onReorder && dragIndex !== null && dragIndex !== targetIndex) {
      const next = [...videos];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      onReorder(next.map((video) => video.url));
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  function moveItem(index: number, direction: number) {
    const target = index + direction;
    if (!onReorder || target < 0 || target >= videos.length) return;
    const next = [...videos];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onReorder(next.map((video) => video.url));
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-2 border-border border-b px-3 py-3">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="flex min-w-0 flex-1 flex-col items-start text-left"
        >
          <span className="truncate font-medium text-fg text-sm">{playlist.name}</span>
          <span className="text-fg-soft text-xs">
            {currentIndex >= 0 ? currentIndex + 1 : "-"} / {videos.length}
          </span>
        </button>
        <button
          type="button"
          onClick={onToggleShuffle}
          aria-label="Shuffle playlist"
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-medium text-xs transition-colors ${
            shuffle ? "bg-fg text-app" : "text-fg-muted hover:bg-surface-strong hover:text-fg"
          }`}
        >
          <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
          Shuffle
        </button>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? "Expand playlist" : "Collapse playlist"}
          className="shrink-0 text-fg-muted transition-colors hover:text-fg"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${collapsed ? "" : "rotate-180"}`}
            aria-hidden="true"
          />
        </button>
      </div>
      {!collapsed && (
        <ul className="max-h-[26rem] list-none overflow-y-auto py-1">
          {videos.map((video, index) => {
            const isCurrent = toPublicWatchParam(video.url) === currentParam;
            return (
              <li
                key={video.id}
                data-pl-row="true"
                className={`group flex items-center gap-1 px-1 transition-colors ${
                  isCurrent ? "bg-surface-strong" : "hover:bg-surface-strong/60"
                } ${overIndex === index && dragIndex !== null ? "ring-1 ring-accent ring-inset" : ""} ${
                  dragIndex === index ? "opacity-40" : ""
                }`}
                onDragOver={reorderable ? (event) => event.preventDefault() : undefined}
                onDragEnter={reorderable ? () => setOverIndex(index) : undefined}
                onDrop={reorderable ? () => handleDrop(index) : undefined}
                onDragEnd={
                  reorderable
                    ? () => {
                        setDragIndex(null);
                        setOverIndex(null);
                      }
                    : undefined
                }
              >
                <WatchPlaylistHandle
                  reorderable={reorderable}
                  isMobile={isMobile}
                  index={index}
                  total={videos.length}
                  onDragStart={(event) => handleDragStart(event, index)}
                  onMove={(direction) => moveItem(index, direction)}
                />
                <Link
                  to="/watch"
                  search={{
                    v: toPublicWatchParam(video.url),
                    list: listId,
                    ...(shuffle ? { shuffle: true } : {}),
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
                      <p className="mt-0.5 truncate text-[11px] text-fg-soft">
                        {video.channelName}
                      </p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
