import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addSearchHistory, clearSearchHistory, fetchSearchHistoryPage } from "../lib/api-user";
import type { SearchHistoryItem } from "../types/user";
import { useAuth } from "./use-auth";

const KEY = ["search-history"];
const PAGE_SIZE = 8;

type SearchHistoryPage = {
  items: SearchHistoryItem[];
  total: number;
  page: number;
  limit: number;
};

type SearchHistoryData = InfiniteData<SearchHistoryPage, number>;

function emptySearchHistoryData(
  data: SearchHistoryData | undefined,
): SearchHistoryData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, items: [], total: 0 })),
  };
}

export function useSearchHistory() {
  const qc = useQueryClient();
  const { authReady, isAuthed } = useAuth();
  const query = useInfiniteQuery({
    queryKey: KEY,
    queryFn: ({ pageParam = 1 }) => fetchSearchHistoryPage(pageParam, PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: authReady && isAuthed,
    gcTime: 0,
  });

  const visibleItems = query.data?.pages.flatMap((page) => page.items) ?? [];
  const total = query.data?.pages[0]?.total ?? 0;
  const canLoadMore = visibleItems.length < total;

  const add = useMutation({
    mutationFn: async (term: string) => {
      if (!isAuthed) return;
      await addSearchHistory(term);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  const clear = useMutation({
    mutationFn: () => (isAuthed ? clearSearchHistory() : Promise.resolve()),
    onSuccess: () => {
      qc.setQueryData<SearchHistoryData>(KEY, emptySearchHistoryData);
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  function loadMore() {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }

  return {
    query,
    total,
    visibleItems,
    canLoadMore,
    loadMore,
    add,
    clear,
  };
}
