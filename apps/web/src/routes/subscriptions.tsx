import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { VideoGrid } from "../components/video-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { streamQueryOptions } from "../hooks/use-stream";
import { useSubscriptionFeed } from "../hooks/use-subscription-feed";
import { useSubscriptions } from "../hooks/use-subscriptions";
import { ApiError } from "../lib/api";

function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const prefetchedIdsRef = useRef(new Set<string>());
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

  if (isLoading) return <VideoGridSkeleton idPrefix="subscriptions" />;

  return (
    <>
      <VideoGrid streams={visible} />
      {isFetchingNextPage && <VideoGridSkeleton idPrefix="subscriptions-next" />}
      <ScrollSentinel onIntersect={fetchNextPage} enabled={hasNextPage && !isFetchingNextPage} />
    </>
  );
}

export const Route = createFileRoute("/subscriptions")({
  component: SubscriptionsPage,
});
