import { useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { useSearchHistory } from "../hooks/use-search-history";
import { useSearchOverlayNavigation } from "../hooks/use-search-overlay-navigation";
import { fetchSuggestions } from "../lib/api-suggestions";
import { buildSearchOverlayItems } from "../lib/search-overlay-items";
import {
  resolveInitialSearchOverlayQuery,
  writeSearchOverlayQuery,
} from "../lib/search-overlay-query";
import { ConfirmModal } from "./confirm-modal";
import { SearchOverlayList } from "./search-overlay-list";

type Props = {
  onClose: () => void;
};

export function SearchOverlay({ onClose }: Props) {
  const location = useRouterState({ select: (state) => state.location });
  const [query, setQuery] = useState(() =>
    resolveInitialSearchOverlayQuery(location.pathname, location.searchStr),
  );
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { service, navigateAndClose } = useSearchOverlayNavigation({ onClose });
  const { visibleItems, canLoadMore, loadMore, clear } = useSearchHistory();
  const debouncedQuery = useDebouncedValue(query, 300);
  const items = buildSearchOverlayItems(query, visibleItems, suggestions);

  useEffect(() => {
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    fetchSuggestions(debouncedQuery.trim(), service)
      .then((s) => {
        if (!cancelled) setSuggestions(s);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, service]);

  useEffect(() => {
    if (selectedIndex < 0) return;
    const element = listRef.current?.querySelector<HTMLButtonElement>(
      `button[data-item-index="${selectedIndex}"]`,
    );
    element?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  const showHistory = query.trim().length === 0 && visibleItems.length > 0;

  function submitTerm(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    writeSearchOverlayQuery(trimmed);
    navigateAndClose(trimmed);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIndex >= 0 && items[selectedIndex]) {
      submitTerm(items[selectedIndex].label);
      return;
    }
    submitTerm(query);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((index) => (index >= items.length - 1 ? 0 : index + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((index) => (index <= 0 ? items.length - 1 : index - 1));
    } else if (e.key === "Tab") {
      const selected = selectedIndex >= 0 ? items[selectedIndex] : items[0];
      if (!selected) return;
      e.preventDefault();
      setQuery(selected.label);
      setSelectedIndex(-1);
    }
  }

  function handleHistoryScroll(e: React.UIEvent<HTMLUListElement>) {
    if (!showHistory || !canLoadMore) return;
    const target = e.currentTarget;
    const threshold = target.scrollHeight - target.clientHeight - 24;
    if (target.scrollTop >= threshold) {
      loadMore();
    }
  }

  function handleConfirmClear() {
    clear.mutate();
    setConfirmClearOpen(false);
  }

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-app text-fg">
      <div className="flex h-full flex-col pt-[env(safe-area-inset-top)]">
        <form
          onSubmit={handleSubmit}
          className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-app px-2"
        >
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-fg hover:bg-surface-strong"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              writeSearchOverlayQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search videos, channels..."
            className="h-10 min-w-0 flex-1 rounded-full bg-surface-strong px-4 text-base text-fg placeholder:text-fg-soft focus:outline-none"
          />
        </form>
        <div className="min-h-0 flex-1 overflow-hidden px-2 pt-2">
          <SearchOverlayList
            items={items}
            showHistory={showHistory}
            selectedIndex={selectedIndex}
            listRef={listRef}
            onScroll={handleHistoryScroll}
            onClearAll={() => setConfirmClearOpen(true)}
            onSelect={submitTerm}
            className="max-h-full overflow-y-auto scroll-smooth rounded-xl border border-border bg-surface"
          />
        </div>
      </div>
      {confirmClearOpen && (
        <ConfirmModal
          title="Clear search history?"
          description="This removes all saved searches from your account."
          confirmLabel="Clear all"
          onConfirm={handleConfirmClear}
          onCancel={() => setConfirmClearOpen(false)}
        />
      )}
    </div>
  );
}
