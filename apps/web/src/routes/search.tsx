import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { type SearchResultItem, SearchResultsGrid } from "../components/search-results-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useSearch } from "../hooks/use-search";

function SearchPage() {
  const { q, service } = Route.useSearch();
  const navigate = useNavigate();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useSearch(q, service);
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

  if (isLoading) return <VideoGridSkeleton idPrefix="search" />;

  return (
    <div>
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
        <p className="text-fg-muted text-sm">No results for &ldquo;{q}&rdquo;</p>
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
  }),
  component: SearchPage,
});
