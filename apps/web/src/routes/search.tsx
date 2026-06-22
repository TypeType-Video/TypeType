import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { FamilyListEmptyState } from "../components/family-list-empty-state";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { SearchFilterBar } from "../components/search-filter-bar";
import { type SearchResultItem, SearchResultsGrid } from "../components/search-results-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useSearch } from "../hooks/use-search";
import { useSearchFilters } from "../hooks/use-search-filters";
import { useSettings } from "../hooks/use-settings";

function SearchPage() {
  const { q, service, contentFilter, sortFilter } = Route.useSearch();
  const navigate = useNavigate();
  const filters = useSearchFilters(service);
  const { settings } = useSettings();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useSearch(
    q,
    service,
    contentFilter,
    sortFilter,
  );
  const { filter } = useBlockedFilter();

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const firstPage = data?.pages[0];
  const suggestion = firstPage?.searchSuggestion ?? null;
  const isCorrected = firstPage?.isCorrectedSearch ?? false;

  const seen = new Set<string>();
  const items: SearchResultItem[] = [];
  for (const page of data?.pages ?? []) {
    for (const channel of page.channels) {
      if (seen.has(channel.url)) continue;
      seen.add(channel.url);
      items.push({ kind: "channel", channel });
    }
    for (const playlist of page.playlists) {
      if (seen.has(playlist.url)) continue;
      seen.add(playlist.url);
      items.push({ kind: "playlist", playlist });
    }
    for (const stream of filter(page.streams)) {
      if (seen.has(stream.id)) continue;
      seen.add(stream.id);
      items.push({ kind: "video", stream });
    }
  }

  function handleSuggestion() {
    if (!suggestion) return;
    navigate({ to: "/search", search: { q: suggestion, service } });
  }

  function setContentFilter(value: string | undefined) {
    navigate({ to: "/search", search: { q, service, contentFilter: value, sortFilter } });
  }

  function setSortFilter(value: string | undefined) {
    navigate({ to: "/search", search: { q, service, contentFilter, sortFilter: value } });
  }

  const filterBar = filters.data ? (
    <SearchFilterBar
      filters={filters.data}
      contentFilter={contentFilter}
      sortFilter={sortFilter}
      onContentChange={setContentFilter}
      onSortChange={setSortFilter}
    />
  ) : null;

  if (isLoading)
    return (
      <div className="pt-3 sm:pt-4">
        {filterBar}
        <VideoGridSkeleton idPrefix="search" />
      </div>
    );

  return (
    <div className="pt-3 sm:pt-4">
      {filterBar}
      {isCorrected && suggestion && (
        <p className="text-sm text-fg-muted mb-4">
          Showing results for <span className="text-fg font-medium">{suggestion}</span>.{" "}
          <button
            type="button"
            onClick={handleSuggestion}
            className="text-accent hover:text-accent-strong underline"
          >
            Search instead for &ldquo;{q}&rdquo;
          </button>
        </p>
      )}
      {!isCorrected && suggestion && (
        <p className="text-sm text-fg-muted mb-4">
          Did you mean{" "}
          <button
            type="button"
            onClick={handleSuggestion}
            className="text-accent hover:text-accent-strong underline"
          >
            {suggestion}
          </button>
          ?
        </p>
      )}
      {items.length === 0 ? (
        settings.accessMode === "allow_list" ? (
          <FamilyListEmptyState
            title="No family-list results"
            description="Try a channel you already trust, or add more channels to the family list."
          />
        ) : (
          <p className="text-fg-muted text-sm">No results for &ldquo;{q}&rdquo;</p>
        )
      ) : (
        <SearchResultsGrid items={items} />
      )}
      {isFetchingNextPage && <VideoGridSkeleton idPrefix="search-next" />}
      <ScrollSentinel onIntersect={loadMore} enabled={!!hasNextPage && !isFetchingNextPage} />
    </div>
  );
}

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
    service: typeof search.service === "number" ? search.service : 0,
    ...(typeof search.contentFilter === "string" ? { contentFilter: search.contentFilter } : {}),
    ...(typeof search.sortFilter === "string" ? { sortFilter: search.sortFilter } : {}),
  }),
  component: SearchPage,
});
