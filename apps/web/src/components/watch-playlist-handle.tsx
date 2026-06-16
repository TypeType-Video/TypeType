import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import type { DragEvent } from "react";

type Props = {
  reorderable: boolean;
  isMobile: boolean;
  index: number;
  total: number;
  onDragStart: (event: DragEvent) => void;
  onMove: (direction: number) => void;
};

export function WatchPlaylistHandle({
  reorderable,
  isMobile,
  index,
  total,
  onDragStart,
  onMove,
}: Props) {
  if (!reorderable) {
    return <span className="w-5 shrink-0 text-center text-fg-soft text-xs">{index + 1}</span>;
  }
  if (isMobile) {
    return (
      <div className="flex w-5 shrink-0 flex-col items-center text-fg-soft">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label="Move up"
          className="transition-colors hover:text-fg disabled:opacity-30"
        >
          <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          aria-label="Move down"
          className="transition-colors hover:text-fg disabled:opacity-30"
        >
          <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }
  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onClick={(event) => event.preventDefault()}
      aria-label="Drag to reorder"
      className="flex w-5 shrink-0 cursor-grab justify-center text-fg-soft transition-colors hover:text-fg active:cursor-grabbing"
    >
      <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
