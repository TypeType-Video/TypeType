import { type DragEvent, useState } from "react";
import type { PlaylistVideoItem } from "../types/user";
import { PlaylistVideoRow } from "./playlist-video-row";

type Props = {
  videos: PlaylistVideoItem[];
  reorderable: boolean;
  listId: string;
  onRemove: (video: PlaylistVideoItem) => void;
  onReorder: (order: string[]) => void;
};

export function PlaylistGrid({ videos, reorderable, listId, onRemove, onReorder }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDragStart(event: DragEvent, index: number) {
    setDragIndex(index);
    event.dataTransfer.effectAllowed = "move";
    const card = (event.currentTarget as HTMLElement).closest("[data-pl-card]");
    if (card instanceof HTMLElement) event.dataTransfer.setDragImage(card, 20, 20);
  }

  function handleDrop(targetIndex: number) {
    if (dragIndex !== null && dragIndex !== targetIndex) {
      const next = [...videos];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      onReorder(next.map((video) => video.url));
    }
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <ul className="grid list-none grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {videos.map((video, index) => (
        <li
          key={video.url}
          data-pl-card="true"
          className={`animate-card-pop-in rounded-xl ${
            reorderable && overIndex === index && dragIndex !== null ? "ring-2 ring-accent" : ""
          } ${reorderable && dragIndex === index ? "opacity-40" : ""}`}
          style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
          onDragOver={
            reorderable
              ? (event) => {
                  event.preventDefault();
                  setOverIndex(index);
                }
              : undefined
          }
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
          <PlaylistVideoRow
            video={video}
            onRemove={() => onRemove(video)}
            reorderable={reorderable}
            listId={listId}
            onDragStart={(event) => handleDragStart(event, index)}
          />
        </li>
      ))}
    </ul>
  );
}
