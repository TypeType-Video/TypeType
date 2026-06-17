import type { SearchFiltersResponse } from "../types/api";

function prettifyLabel(raw: string): string {
  const afterColon = raw.includes(":") ? raw.slice(raw.indexOf(":") + 1) : raw;
  const base = afterColon.trim();
  const stripped = base.startsWith("sort_") ? base.slice(5) : base;
  return stripped
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function chipClass(active: boolean): string {
  const base =
    "shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors";
  return active
    ? `${base} bg-fg text-app`
    : `${base} bg-surface-strong text-fg hover:bg-surface-soft`;
}

type Props = {
  filters: SearchFiltersResponse;
  contentFilter: string | undefined;
  sortFilter: string | undefined;
  onContentChange: (value: string | undefined) => void;
  onSortChange: (value: string | undefined) => void;
};

export function SearchFilterBar({
  filters,
  contentFilter,
  sortFilter,
  onContentChange,
  onSortChange,
}: Props) {
  const contentOptions = filters.contentFilters.filter((option) => option.label !== "all");
  const { sortFilters } = filters;

  if (contentOptions.length === 0 && sortFilters.length === 0) return null;

  return (
    <div className="mb-5 flex flex-col gap-2">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onContentChange(undefined)}
          className={chipClass(!contentFilter)}
        >
          All
        </button>
        {contentOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onContentChange(option.value)}
            className={chipClass(contentFilter === option.value)}
          >
            {prettifyLabel(option.label)}
          </button>
        ))}
      </div>
      {sortFilters.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onSortChange(undefined)}
            className={chipClass(!sortFilter)}
          >
            Relevance
          </button>
          {sortFilters.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSortChange(option.value)}
              className={chipClass(sortFilter === option.value)}
            >
              {prettifyLabel(option.label)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
