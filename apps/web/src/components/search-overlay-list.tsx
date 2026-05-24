import type { RefObject } from "react";
import type { SearchOverlayItem } from "../lib/search-overlay-items";

type Props = {
  items: SearchOverlayItem[];
  showHistory: boolean;
  selectedIndex: number;
  listRef: RefObject<HTMLUListElement | null>;
  onScroll: (e: React.UIEvent<HTMLUListElement>) => void;
  onClearAll?: () => void;
  onSelect: (term: string) => void;
  className?: string;
};

export function SearchOverlayList({
  items,
  showHistory,
  selectedIndex,
  listRef,
  onScroll,
  onClearAll,
  onSelect,
  className,
}: Props) {
  if (items.length === 0) return null;

  const listClass =
    className ??
    "mt-1 max-h-[22rem] overflow-y-auto scroll-smooth bg-surface border border-border-strong rounded-lg";

  return (
    <ul ref={listRef} onScroll={onScroll} className={listClass}>
      {showHistory && (
        <li className="px-4 py-2 flex items-center justify-between">
          <span className="text-xs text-fg-soft uppercase tracking-wider">Recent searches</span>
          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-fg-soft hover:text-fg-muted transition-colors"
            >
              Clear all
            </button>
          )}
        </li>
      )}
      {items.map((item, index) => (
        <li
          key={item.key}
          className="animate-card-pop-in"
          style={{ animationDelay: `${Math.min(index * 24, 168)}ms` }}
        >
          <button
            type="button"
            data-item-index={index}
            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
              index === selectedIndex
                ? "bg-surface-soft text-fg"
                : "text-fg-muted hover:bg-surface-strong"
            }`}
            onClick={() => onSelect(item.label)}
          >
            <span className="inline-flex items-center gap-2">
              <span>{item.label}</span>
              {item.source === "history" && !showHistory && (
                <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-fg-soft">
                  History
                </span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
