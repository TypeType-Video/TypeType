import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { SubscriptionChannelList } from "../components/subscription-channel-list";
import { VideoGrid } from "../components/video-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { streamQueryOptions } from "../hooks/use-stream";
import { useSubscriptionFeed } from "../hooks/use-subscription-feed";
import { useSubscriptions } from "../hooks/use-subscriptions";
import { ApiError } from "../lib/api";

type SubscriptionView = "videos" | "channels";

function viewButtonClass(active: boolean): string {
  return active
    ? "bg-fg text-app"
    : "border border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg";
}

function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const prefetchedIdsRef = useRef(new Set<string>());
  const [view, setView] = useState<SubscriptionView>("videos");
  const { query } = useSubscriptions();
  const subscriptions = query.data ?? [];
  const { streams, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSubscriptionFeed();
  const { filter } = useBlockedFilter();
  const visible = useMemo(() => filter(streams), [filter, streams]);

  useEffect(() => {
    if (streams.length > 0) {
      const topVideos = streams.slice(0, 5);
      for (const video of topVideos) {
        if (prefetchedIdsRef.current.has(video.id)) continue;
        prefetchedIdsRef.current.add(video.id);
        void queryClient.prefetchQuery(streamQueryOptions(video.id)).catch((error) => {
          if (error instanceof ApiError && [400, 404, 422].includes(error.status)) return;
        });
      }
    }
  }, [streams, queryClient]);

  if (query.isLoading) return <VideoGridSkeleton idPrefix="subscriptions-list" />;

  if (subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center pt-32">
        <p className="text-fg-muted text-sm">No subscriptions yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-fg">Subscriptions</h1>
          <p className="text-xs text-fg-soft">
            {subscriptions.length} {subscriptions.length === 1 ? "channel" : "channels"}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={() => setView("videos")}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${viewButtonClass(view === "videos")}`}
          >
            Videos
          </button>
          <button
            type="button"
            onClick={() => setView("channels")}
            className={`rounded-full px-4 py-2 text-sm transition-colors ${viewButtonClass(view === "channels")}`}
          >
            Channels
          </button>
        </div>
      </div>
      {view === "channels" ? (
        <SubscriptionChannelList subscriptions={subscriptions} />
      ) : isLoading ? (
        <VideoGridSkeleton idPrefix="subscriptions" />
      ) : (
        <>
          <VideoGrid streams={visible} />
          {isFetchingNextPage && <VideoGridSkeleton idPrefix="subscriptions-next" />}
          <ScrollSentinel
            onIntersect={fetchNextPage}
            enabled={hasNextPage && !isFetchingNextPage}
          />
        </>
      )}
    </div>
  );
}

export const Route = createFileRoute("/subscriptions")({
  component: SubscriptionsPage,
});
