import { useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "../hooks/use-debounced-value";
import { useSearchHistory } from "../hooks/use-search-history";
import { useSearchOverlayNavigation } from "../hooks/use-search-overlay-navigation";
import { fetchSuggestions } from "../lib/api-suggestions";
import { buildSearchOverlayItems } from "../lib/search-overlay-items";
import { SearchOverlayList } from "./search-overlay-list";

export function NavbarSearch() {
  const location = useRouterState({ select: (state) => state.location });
  const currentSearch =
    location.pathname === "/search" ? (new URLSearchParams(location.searchStr).get("q") ?? "") : "";
  const [query, setQuery] = useState(currentSearch);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const { service, navigateAndClose } = useSearchOverlayNavigation({
    onClose: () => setOpen(false),
  });
  const { visibleItems, canLoadMore, loadMore } = useSearchHistory();
  const debouncedQuery = useDebouncedValue(query, 300);
  const items = buildSearchOverlayItems(query, visibleItems, suggestions);
  const showHistory = query.trim().length === 0 && visibleItems.length > 0;

  useEffect(() => {
    setQuery(currentSearch);
  }, [currentSearch]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    fetchSuggestions(debouncedQuery.trim(), service)
      .then((next) => {
        if (!cancelled) setSuggestions(next);
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

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const selected = selectedIndex >= 0 ? items[selectedIndex]?.label : undefined;
    navigateAndClose(selected ?? query);
  }

  function selectTerm(term: string) {
    setQuery(term);
    navigateAndClose(term);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (items.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setSelectedIndex((index) => (index >= items.length - 1 ? 0 : index + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setSelectedIndex((index) => (index <= 0 ? items.length - 1 : index - 1));
      return;
    }
    if (e.key === "Tab") {
      const selected = selectedIndex >= 0 ? items[selectedIndex] : items[0];
      if (!selected) return;
      e.preventDefault();
      setQuery(selected.label);
      setSelectedIndex(-1);
    }
  }

  function handleScroll(e: React.UIEvent<HTMLUListElement>) {
    if (!showHistory || !canLoadMore) return;
    const target = e.currentTarget;
    const threshold = target.scrollHeight - target.clientHeight - 24;
    if (target.scrollTop >= threshold) loadMore();
  }

  return (
    <search className="mx-4 flex min-w-0 flex-1 justify-center">
      <div ref={rootRef} className="relative w-full max-w-2xl min-w-0">
        <form onSubmit={submit} className="flex h-10 w-full min-w-0">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search"
            className="min-w-0 flex-1 rounded-l-full border border-border-strong bg-app px-4 text-sm text-fg placeholder:text-fg-soft outline-none focus:border-fg"
          />
          <button
            type="submit"
            className="flex w-16 items-center justify-center rounded-r-full border border-l-0 border-border-strong bg-surface-strong text-fg hover:bg-surface-soft"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </form>
        {open && items.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-50">
            <SearchOverlayList
              items={items}
              showHistory={showHistory}
              selectedIndex={selectedIndex}
              listRef={listRef}
              onScroll={handleScroll}
              onSelect={selectTerm}
            />
          </div>
        )}
      </div>
    </search>
  );
}
