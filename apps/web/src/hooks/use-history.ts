import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProgress } from "../lib/api-collections";
import { addHistory, clearHistory, fetchHistory, removeHistory } from "../lib/api-user";
import type { HistoryItem, ProgressItem } from "../types/user";
import { useAuth } from "./use-auth";
import { useDebouncedValue } from "./use-debounced-value";

const PAGE_SIZE = 40;

const historyKey = (q: string) => ["history", q];

type HistoryPage = {
  items: HistoryItem[];
  total: number;
};

type HistoryInfiniteData = InfiniteData<HistoryPage, number>;

type RemoveHistoryPayload = {
  id: string;
  url: string;
};

function clearedProgress(url: string): ProgressItem {
  return { videoUrl: url, position: 0, updatedAt: Date.now() };
}

function emptyHistoryData(data: HistoryInfiniteData | undefined): HistoryInfiniteData | undefined {
  if (!data) return data;
  return {
    ...data,
    pages: data.pages.map((page) => ({ ...page, items: [], total: 0 })),
  };
}

export function useHistory(searchQuery = "") {
  const qc = useQueryClient();
  const { authReady, isAuthed } = useAuth();
  const debouncedQuery = useDebouncedValue(searchQuery, 300);

  const query = useInfiniteQuery({
    queryKey: historyKey(debouncedQuery),
    queryFn: ({ pageParam = 0 }) =>
      fetchHistory({
        q: debouncedQuery || undefined,
        limit: PAGE_SIZE,
        offset: pageParam,
      }),
    getNextPageParam: (lastPage, pages) => {
      const fetched = pages.reduce((sum, p) => sum + p.items.length, 0);
      return fetched < lastPage.total ? fetched : undefined;
    },
    initialPageParam: 0,
    enabled: authReady && isAuthed,
  });

  const add = useMutation({
    mutationFn: async (item: Omit<HistoryItem, "id" | "watchedAt">) => {
      if (!isAuthed) return;
      const cached = qc.getQueryData<{ pages: { items: HistoryItem[] }[] }>(historyKey(""));
      const existing = cached?.pages.flatMap((p) => p.items).find((h) => h.url === item.url);
      if (existing) await removeHistory(existing.id);
      await addHistory(item);
    },
    onSuccess: () =>
      qc
        .invalidateQueries({ queryKey: ["history"] })
        .then(() => qc.invalidateQueries({ queryKey: ["history-all"] })),
  });

  const remove = useMutation({
    mutationFn: async ({ id, url }: RemoveHistoryPayload) => {
      if (!isAuthed) return;
      await updateProgress(url, 0);
      await removeHistory(id);
    },
    onSuccess: (_, payload) => {
      qc.setQueryData(["progress", payload.url], clearedProgress(payload.url));
      return qc
        .invalidateQueries({ queryKey: ["history"] })
        .then(() => qc.invalidateQueries({ queryKey: ["history-all"] }))
        .then(() => qc.invalidateQueries({ queryKey: ["progress", payload.url] }));
    },
  });

  const clear = useMutation({
    mutationFn: async () => {
      if (!isAuthed) return;
      await clearHistory();
    },
    onSuccess: () => {
      qc.setQueriesData<HistoryInfiniteData>({ queryKey: ["history"] }, emptyHistoryData);
      qc.setQueriesData<HistoryPage>({ queryKey: ["history-filtered"] }, (data) =>
        data ? { ...data, items: [], total: 0 } : data,
      );
      qc.removeQueries({ queryKey: ["progress"] });
      return qc
        .invalidateQueries({ queryKey: ["history"] })
        .then(() => qc.invalidateQueries({ queryKey: ["history-filtered"] }))
        .then(() => qc.invalidateQueries({ queryKey: ["history-all"] }));
    },
  });

  const total = query.data?.pages[0]?.total ?? 0;
  const rawItems = query.data?.pages.flatMap((p) => p.items) ?? [];
  const seen = new Set<string>();
  const items = rawItems.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  return { query, items, total, add, remove, clear };
}
