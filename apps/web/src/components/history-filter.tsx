import { useState } from "react";
import { HistoryCalendar } from "./history-calendar";

export type FilterState =
  | { kind: "preset"; value: "today" | "week" | "month" }
  | { kind: "date"; date: Date };

type Props = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filter: FilterState | null;
  onFilterChange: (value: FilterState | null) => void;
  resultCount: number;
  canClearHistory: boolean;
  onClearHistory: () => void;
};

const PRESET_OPTIONS = [
  { label: "Today", value: "today" as const },
  { label: "This week", value: "week" as const },
  { label: "This month", value: "month" as const },
];

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Search"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function HistoryFilter({
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  resultCount,
  canClearHistory,
  onClearHistory,
}: Props) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const hasActiveFilter = searchQuery.length > 0 || filter !== null;

  const isPresetActive = (value: string) => filter?.kind === "preset" && filter.value === value;

  const selectedDate = filter?.kind === "date" ? filter.date : null;

  const olderActive = filter?.kind === "date" || calendarOpen;

  const handlePreset = (value: "today" | "week" | "month") => {
    setCalendarOpen(false);
    onFilterChange(isPresetActive(value) ? null : { kind: "preset", value });
  };

  const handleOlderToggle = () => {
    if (calendarOpen) {
      setCalendarOpen(false);
      if (filter?.kind === "date") onFilterChange(null);
    } else {
      setCalendarOpen(true);
      onFilterChange(null);
    }
  };

  const handleDateSelect = (date: Date) => {
    onFilterChange({ kind: "date", date });
  };

  const handleClear = () => {
    onSearchChange("");
    onFilterChange(null);
    setCalendarOpen(false);
  };

  return (
    <aside className="order-first flex w-full flex-shrink-0 flex-col gap-4 lg:order-none lg:sticky lg:top-20 lg:w-52 lg:self-start lg:gap-5">
      <div>
        <div className="mb-2.5 flex items-center justify-between gap-3">
          <p className="text-[11px] text-fg-soft uppercase tracking-wider">
            {resultCount} {resultCount === 1 ? "video" : "videos"}
          </p>
          {canClearHistory && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-[11px] text-danger transition-colors hover:text-danger-strong"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-soft pointer-events-none">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search history..."
            className="w-full h-9 bg-surface border border-border rounded-lg pl-8 pr-3 text-xs text-fg placeholder-zinc-600 focus:outline-none focus:border-border-strong transition-colors"
          />
        </div>
      </div>

      <div>
        <p className="text-[11px] text-fg-soft uppercase tracking-wider mb-2">Date</p>
        <div className="grid grid-cols-2 gap-1 lg:flex lg:flex-col lg:gap-0.5">
          {PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handlePreset(opt.value)}
              className={`h-8 px-2.5 rounded-lg text-xs text-left transition-colors ${
                isPresetActive(opt.value)
                  ? "bg-fg text-app font-medium"
                  : "text-fg-muted hover:text-fg hover:bg-surface-strong"
              }`}
            >
              {opt.label}
            </button>
          ))}

          <button
            type="button"
            onClick={handleOlderToggle}
            className={`col-span-2 h-8 px-2.5 rounded-lg text-xs text-left transition-colors ${
              olderActive
                ? "bg-fg text-app font-medium"
                : "text-fg-muted hover:text-fg hover:bg-surface-strong"
            }`}
          >
            {selectedDate ? formatDate(selectedDate) : "Older"}
          </button>

          {calendarOpen && <HistoryCalendar selected={selectedDate} onSelect={handleDateSelect} />}
        </div>
      </div>

      {hasActiveFilter && (
        <button
          type="button"
          onClick={handleClear}
          className="text-[11px] text-fg-soft hover:text-fg-muted transition-colors text-left"
        >
          Clear filters
        </button>
      )}
    </aside>
  );
}
