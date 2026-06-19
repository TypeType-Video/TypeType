import { ChevronDown, Shuffle } from "lucide-react";
import { type DragEvent, type UIEvent, useEffect, useRef, useState } from "react";
import { useFlipList } from "../hooks/use-flip-list";
import { useMobile } from "../hooks/use-mobile";
import { toPublicWatchParam } from "../lib/watch-url";
import type { WatchPlaylistItem } from "../types/playlist";
import { WatchPlaylistRow } from "./watch-playlist-row";

type Props = {
  name: string;
  videos: WatchPlaylistItem[];
  listId: string;
  currentParam: string;
  shuffle: string | undefined;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  onToggleShuffle: () => void;
  onReorder?: (videos: WatchPlaylistItem[]) => void;
};

export function WatchPlaylistPanel({
  name,
  videos,
  listId,
  currentParam,
  shuffle,
  isLoadingMore = false,
  onLoadMore,
  onToggleShuffle,
  onReorder,
}: Props) {
  const isMobile = useMobile();
  const [collapsed, setCollapsed] = useState(isMobile);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const currentElement = useRef<HTMLLIElement | null>(null);
  const currentIndex = videos.findIndex((video) => toPublicWatchParam(video.url) === currentParam);
  const reorderable = Boolean(onReorder);
  const register = useFlipList(videos.map((video) => video.key).join("|"));

  useEffect(() => {
    if (!collapsed && currentIndex >= 0) {
      currentElement.current?.scrollIntoView({ block: "nearest" });
    }
  }, [collapsed, currentIndex]);

  function commit(next: WatchPlaylistItem[]) {
    onReorder?.(next);
  }
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
      commit(next);
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
    commit(next);
  }
  function handleScroll(event: UIEvent<HTMLUListElement>) {
    if (!onLoadMore || isLoadingMore) return;
    const list = event.currentTarget;
    const remaining = list.scrollHeight - list.scrollTop - list.clientHeight;
    if (remaining < 480) onLoadMore();
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
      {!collapsed && (
        <ul className="max-h-[24rem] list-none overflow-y-auto py-1" onScroll={handleScroll}>
          {videos.map((video, index) => {
            const isCurrent = index === currentIndex;

            return (
              <li
                key={video.key}
                ref={(element) => {
                  register(video.key, element);
                  if (isCurrent) currentElement.current = element;
                }}
                data-pl-row="true"
                className={`group flex items-center gap-1 px-1 transition-colors hover:bg-surface-strong/60 ${
                  overIndex === index && dragIndex !== null ? "ring-1 ring-accent ring-inset" : ""
                } ${dragIndex === index ? "opacity-40" : ""} ${isCurrent ? "bg-surface-strong" : ""}`}
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
                  total={videos.length}
                  isCurrent={isCurrent}
                  reorderable={reorderable}
                  isMobile={isMobile}
                  listId={listId}
                  shuffle={shuffle}
                  onDragStart={(event) => handleDragStart(event, index)}
                  onMove={(direction) => moveItem(index, direction)}
                />
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
