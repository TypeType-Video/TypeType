import { ChevronDown, Play, Shuffle } from "lucide-react";
import { type DragEvent, useState } from "react";
import { useFlipList } from "../hooks/use-flip-list";
import { useMobile } from "../hooks/use-mobile";
import { proxyImage } from "../lib/proxy";
import { toPublicWatchParam } from "../lib/watch-url";
import type { WatchPlaylistItem } from "../types/playlist";
import { WatchPlaylistRow } from "./watch-playlist-row";

type Props = {
  name: string;
  videos: WatchPlaylistItem[];
  listId: string;
  currentParam: string;
  shuffle: string | undefined;
  onToggleShuffle: () => void;
  onReorder?: (videos: WatchPlaylistItem[]) => void;
};

export function WatchPlaylistPanel({
  name,
  videos,
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
  const currentIndex = videos.findIndex((video) => toPublicWatchParam(video.url) === currentParam);
  const currentVideo = currentIndex >= 0 ? videos[currentIndex] : undefined;
  const prefix = currentIndex >= 0 ? videos.slice(0, currentIndex + 1) : [];
  const upNext = currentIndex >= 0 ? videos.slice(currentIndex + 1) : videos;
  const reorderable = Boolean(onReorder);
  const register = useFlipList(upNext.map((video) => video.key).join("|"));

  function commit(next: WatchPlaylistItem[]) {
    onReorder?.([...prefix, ...next]);
  }
  function handleDragStart(event: DragEvent, index: number) {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    const row = (event.currentTarget as HTMLElement).closest("[data-pl-row]");
    if (row instanceof HTMLElement) event.dataTransfer.setDragImage(row, 20, 20);
  }
  function handleDrop(targetIndex: number) {
    if (onReorder && dragIndex !== null && dragIndex !== targetIndex) {
      const next = [...upNext];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      commit(next);
    }
    setDragIndex(null);
    setOverIndex(null);
  }
  function moveItem(index: number, direction: number) {
    const target = index + direction;
    if (!onReorder || target < 0 || target >= upNext.length) return;
    const next = [...upNext];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    commit(next);
  }

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex items-center gap-2 border-border border-b px-3 py-3">
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="flex min-w-0 flex-1 flex-col items-start text-left"
        >
          <span className="truncate font-medium text-fg text-sm">{name}</span>
          <span className="text-fg-soft text-xs">
            {currentIndex >= 0 ? currentIndex + 1 : "-"} / {videos.length}
          </span>
        </button>
        <button
          type="button"
          onClick={onToggleShuffle}
          aria-label="Shuffle playlist"
          className={`inline-flex h-8 w-8 shrink-0 items-center justify-center gap-1.5 rounded-full font-medium text-xs transition-colors sm:w-auto sm:rounded-lg sm:px-2.5 sm:py-1.5 ${
            shuffle ? "bg-fg text-app" : "text-fg-muted hover:bg-surface-strong hover:text-fg"
          }`}
        >
          <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Shuffle</span>
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
      {!collapsed && currentVideo && (
        <div className="flex items-center gap-2 border-border border-b bg-surface-strong px-3 py-2">
          <div className="relative aspect-video w-20 shrink-0 overflow-hidden rounded bg-surface">
            {currentVideo.thumbnail && (
              <img
                src={proxyImage(currentVideo.thumbnail)}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <Play className="h-4 w-4 fill-white text-white" aria-hidden="true" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-[11px] text-accent">Now playing</p>
            <p className="line-clamp-2 font-medium text-fg text-xs leading-snug">
              {currentVideo.title}
            </p>
          </div>
        </div>
      )}
      {!collapsed && (
        <ul className="max-h-[24rem] list-none overflow-y-auto py-1">
          {upNext.map((video, index) => (
            <li
              key={video.key}
              ref={(element) => register(video.key, element)}
              data-pl-row="true"
              className={`group flex items-center gap-1 px-1 transition-colors hover:bg-surface-strong/60 ${
                overIndex === index && dragIndex !== null ? "ring-1 ring-accent ring-inset" : ""
              } ${dragIndex === index ? "opacity-40" : ""}`}
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
              <WatchPlaylistRow
                video={video}
                index={index}
                total={upNext.length}
                isCurrent={false}
                reorderable={reorderable}
                isMobile={isMobile}
                listId={listId}
                shuffle={shuffle}
                onDragStart={(event) => handleDragStart(event, index)}
                onMove={(direction) => moveItem(index, direction)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
