import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { SubscriptionsHeader } from "../components/subscriptions-header";
import { VideoGrid } from "../components/video-grid";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { streamQueryOptions } from "../hooks/use-stream";
import { SUBSCRIPTION_FEED_KEY, useSubscriptionFeed } from "../hooks/use-subscription-feed";
import { SUBSCRIPTIONS_KEY, useSubscriptions } from "../hooks/use-subscriptions";
import { ApiError } from "../lib/api";
import { fetchSubscriptionFeed, fetchSubscriptions } from "../lib/api-user";

const SUBSCRIPTION_STALE_MS = 5 * 60 * 1000;

function nextSubscriptionPage(
  last: Awaited<ReturnType<typeof fetchSubscriptionFeed>>,
  pages: unknown[],
) {
  return last.nextpage !== null ? pages.length : undefined;
}

function SubscriptionsPage() {
  const queryClient = useQueryClient();
  const prefetchedIdsRef = useRef(new Set<string>());
  const { query } = useSubscriptions();
  const subscriptions = query.data ?? [];
  const { streams, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSubscriptionFeed();
  const { filter } = useBlockedFilter();
  const visible = useMemo(() => filter(streams), [filter, streams]);

  function prefetchChannels() {
    void queryClient.prefetchQuery({
      queryKey: SUBSCRIPTIONS_KEY,
      queryFn: fetchSubscriptions,
      staleTime: SUBSCRIPTION_STALE_MS,
    });
  }

  function prefetchVideos() {
    void queryClient.prefetchInfiniteQuery({
      queryKey: SUBSCRIPTION_FEED_KEY,
      queryFn: ({ pageParam }) => fetchSubscriptionFeed(pageParam as number),
      initialPageParam: 0,
      getNextPageParam: nextSubscriptionPage,
      staleTime: SUBSCRIPTION_STALE_MS,
    });
  }

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

  if (query.isSuccess && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center pt-32">
        <p className="text-fg-muted text-sm">No subscriptions yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <SubscriptionsHeader
        active="videos"
        count={subscriptions.length}
        onVideosIntent={prefetchVideos}
        onChannelsIntent={prefetchChannels}
      />
      {query.isLoading || isLoading ? (
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
