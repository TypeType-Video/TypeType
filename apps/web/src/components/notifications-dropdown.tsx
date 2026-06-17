import { useEffect, useRef, useState } from "react";
import { useMobile } from "../hooks/use-mobile";
import { useNotifications } from "../hooks/use-notifications";
import { NotificationBellIcon } from "./notification-bell-icon";
import { NotificationRow } from "./notification-row";
import { ScrollSentinel } from "./scroll-sentinel";

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const isMobile = useMobile();
  const rootRef = useRef<HTMLDivElement>(null);
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const {
    enabled,
    query,
    unreadQuery,
    items,
    unreadCount,
    markAllRead,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
  } = useNotifications(open);

  useEffect(() => {
    if (!open || hasLoaded) return;
    setHasLoaded(true);
  }, [open, hasLoaded]);

  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, []);

  if (!enabled) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-9 w-9 items-center justify-center text-fg-muted hover:text-fg"
        aria-label="Notifications"
      >
        <NotificationBellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-danger-strong px-1 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={
            isMobile
              ? "fixed left-2 right-2 top-16 z-50 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-2xl"
              : "absolute right-0 top-full z-50 mt-2 w-[calc(100vw-1rem)] max-w-[26rem] overflow-hidden rounded-xl border border-border-strong bg-surface shadow-2xl"
          }
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Notifications
            </p>
            <button
              type="button"
              onClick={() => markAllRead.mutate()}
              disabled={unreadCount === 0 || markAllRead.isPending}
              className="text-xs text-fg-muted hover:text-fg-strong disabled:cursor-not-allowed disabled:text-fg-soft"
            >
              Mark all read
            </button>
          </div>

          <div ref={setScrollRoot} className="max-h-[28rem] overflow-y-auto px-2 py-2">
            {!hasLoaded && (
              <p className="px-2 py-3 text-xs text-fg-soft">Open notifications to load items.</p>
            )}
            {hasLoaded && query.isFetching && items.length === 0 && (
              <p className="px-2 py-3 text-xs text-fg-soft">Loading notifications...</p>
            )}
            {hasLoaded && query.isError && (
              <p className="px-2 py-3 text-xs text-danger">
                Failed to load notifications. Retry in a few seconds.
              </p>
            )}
            {hasLoaded && !query.isFetching && !query.isError && items.length === 0 && (
              <p className="px-2 py-3 text-xs text-fg-soft">No notifications yet.</p>
            )}
            {items.map((item) => (
              <NotificationRow
                key={`${item.type}-${item.video.id}-${item.createdAt}`}
                item={item}
                onOpen={() => setOpen(false)}
              />
            ))}
            {hasLoaded && (
              <ScrollSentinel
                root={scrollRoot}
                onIntersect={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    void fetchNextPage();
                  }
                }}
                enabled={open && hasNextPage && !isFetchingNextPage}
              />
            )}
            {isFetchingNextPage && (
              <p className="px-2 py-2 text-xs text-fg-soft">Loading more...</p>
            )}
            {isFetchNextPageError && (
              <p className="px-2 py-2 text-xs text-danger">Rate limited while loading more.</p>
            )}
            {unreadQuery.isError && (
              <p className="px-2 py-2 text-xs text-fg-soft">Badge temporarily unavailable.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
