import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import type { ChannelSort } from "../lib/api";
import { CHANNEL_SORT_OPTIONS, channelSortOrDefault } from "../lib/channel-sort";

const CHANNEL_TABS = [
  { live: false, label: "Videos" },
  { live: true, label: "Live" },
];

type Props = {
  sort: ChannelSort;
  query: string;
  live: boolean;
  searchAvailable: boolean;
  onSearch: (query: string) => void;
  onLiveChange: (live: boolean) => void;
  onSortChange: (sort: ChannelSort) => void;
};

export function ChannelFilterBar({
  sort,
  query,
  live,
  searchAvailable,
  onSearch,
  onLiveChange,
  onSortChange,
}: Props) {
  const [input, setInput] = useState(query);
  const trimmedInput = input.trim();
  const isSearching = query.length > 0;

  useEffect(() => {
    setInput(query);
  }, [query]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (searchAvailable) onSearch(trimmedInput);
  }

  function clearSearch() {
    setInput("");
    onSearch("");
  }

  return (
    <section className="border-y border-border py-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {searchAvailable && (
          <div className="flex w-fit items-center gap-2 text-sm">
            {CHANNEL_TABS.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => onLiveChange(tab.live)}
                className={`border-border-strong border-b py-1 font-medium transition-colors ${
                  live === tab.live
                    ? "border-fg text-fg"
                    : "border-transparent text-fg-soft hover:text-fg"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        {searchAvailable && (
          <div className="min-w-0 flex-1 md:max-w-lg">
            <form onSubmit={submitSearch} className="flex min-w-0 items-end gap-3">
              <span className="hidden pb-2 text-xs uppercase tracking-wide text-fg-soft sm:inline">
                Channel
              </span>
              <input
                type="search"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Search this channel"
                className="h-9 min-w-0 flex-1 border-border-strong border-b bg-transparent text-sm text-fg outline-none transition-colors placeholder:text-fg-soft focus:border-fg"
              />
              {input.length > 0 && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="h-9 text-xs font-medium text-fg-soft transition-colors hover:text-fg"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={trimmedInput === query}
                className="h-9 text-xs font-semibold uppercase tracking-wide text-fg transition-colors hover:text-white disabled:cursor-not-allowed disabled:text-fg-soft"
              >
                Search
              </button>
            </form>
          </div>
        )}
        {!isSearching && (
          <div className="flex w-fit items-center gap-2 text-sm">
            {CHANNEL_SORT_OPTIONS.map((option) => {
              const selected = option.value === sort;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSortChange(channelSortOrDefault(option.value))}
                  className={`border-border-strong border-b py-1 font-medium transition-colors ${
                    selected ? "border-fg text-fg" : "border-transparent text-fg-soft hover:text-fg"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {isSearching && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-fg-soft">
          <span>
            Search results for <span className="text-fg">{query}</span>, ranked by YouTube.
          </span>
          <button
            type="button"
            onClick={clearSearch}
            className="font-medium text-fg-muted underline-offset-4 hover:text-fg hover:underline"
          >
            Back to all videos
          </button>
        </div>
      )}
    </section>
  );
}
