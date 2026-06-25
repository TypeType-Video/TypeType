import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ConfirmModal } from "../components/confirm-modal";
import { HistoryCard } from "../components/history-card";
import type { FilterState } from "../components/history-filter";
import { HistoryFilter } from "../components/history-filter";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { Toast } from "../components/toast";
import { useAuth } from "../hooks/use-auth";
import { useHistory } from "../hooks/use-history";
import { fetchHistory } from "../lib/api-user";
import type { HistoryItem } from "../types/user";

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function startOfWeek(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const offset = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - offset);
  return d.getTime();
}

function startOfMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), 1).getTime();
}

type DateRange = { from: number; to: number } | null;

function dedupeByUrl(items: HistoryItem[]): HistoryItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

function rangeFromFilter(filter: FilterState | null): DateRange {
  if (filter === null) return null;
  const now = new Date();
  if (filter.kind === "preset") {
    if (filter.value === "today") return { from: startOfDay(now), to: Number.MAX_SAFE_INTEGER };
    if (filter.value === "week") return { from: startOfWeek(now), to: Number.MAX_SAFE_INTEGER };
    return { from: startOfMonth(now), to: Number.MAX_SAFE_INTEGER };
  }
  const from = startOfDay(filter.date);
  return { from, to: from + 86_400_000 };
}

function HistoryPage() {
  const { isAuthed } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterState | null>(null);
  const [pendingRemoveItem, setPendingRemoveItem] = useState<HistoryItem | null>(null);
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const { query, items, total, remove, clear } = useHistory(searchQuery);
  const dateRange = rangeFromFilter(filter);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const allItemsQuery = useQuery({
    queryKey: ["history-filtered", searchQuery, dateRange?.from ?? null, dateRange?.to ?? null],
    queryFn: () =>
      fetchHistory({
        q: searchQuery || undefined,
        from: dateRange?.from,
        to: dateRange?.to,
        limit: 500,
        offset: 0,
      }),
    enabled: filter !== null && isAuthed,
    staleTime: 30_000,
  });

  const filtered = filter !== null ? dedupeByUrl(allItemsQuery.data?.items ?? []) : items;
  const filteredTotal = filter !== null ? filtered.length : total;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <div className="flex-1 min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-8">
          {filtered.map((item: HistoryItem, index: number) => (
            <HistoryCard
              key={item.id}
              item={item}
              index={index}
              onRemove={() => setPendingRemoveItem(item)}
            />
          ))}
        </div>
        <ScrollSentinel
          onIntersect={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
          }}
          enabled={!!query.hasNextPage && !query.isFetchingNextPage && filter === null}
        />
      </div>
      <HistoryFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filter={filter}
        onFilterChange={setFilter}
        resultCount={filteredTotal}
        canClearHistory={total > 0}
        onClearHistory={() => setClearHistoryOpen(true)}
      />
      {clearHistoryOpen && (
        <ConfirmModal
          title="Clear watch history?"
          description="This removes every video from your watch history."
          confirmLabel="Clear all"
          onConfirm={() => {
            clear.mutate(undefined, {
              onSuccess: () => setToast("Watch history cleared"),
              onError: (error) =>
                setToast(error instanceof Error ? error.message : "Failed to clear history"),
            });
            setClearHistoryOpen(false);
          }}
          onCancel={() => setClearHistoryOpen(false)}
        />
      )}
      {pendingRemoveItem !== null && (
        <ConfirmModal
          title="Remove from history?"
          description="This video will be removed from your watch history."
          confirmLabel="Remove"
          onConfirm={() => {
            remove.mutate({ id: pendingRemoveItem.id, url: pendingRemoveItem.url });
            setPendingRemoveItem(null);
          }}
          onCancel={() => setPendingRemoveItem(null)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}

export const Route = createFileRoute("/history")({ component: HistoryPage });
