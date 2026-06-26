import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SubscriptionChannelList } from "../components/subscription-channel-list";
import { SubscriptionsHeader } from "../components/subscriptions-header";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { SUBSCRIPTION_FEED_KEY } from "../hooks/use-subscription-feed";
import { SUBSCRIPTIONS_KEY, useSubscriptions } from "../hooks/use-subscriptions";
import { fetchSubscriptionFeed, fetchSubscriptions } from "../lib/api-user";

const SUBSCRIPTION_STALE_MS = 5 * 60 * 1000;

function nextSubscriptionPage(
  last: Awaited<ReturnType<typeof fetchSubscriptionFeed>>,
  pages: unknown[],
) {
  return last.nextpage !== null ? pages.length : undefined;
}

function SubscriptionChannelsPage() {
  const queryClient = useQueryClient();
  const { query } = useSubscriptions();
  const subscriptions = query.data ?? [];

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

  if (query.isSuccess && subscriptions.length === 0) {
    return (
      <div className="flex items-center justify-center pt-32">
        <p className="text-sm text-fg-muted">No subscriptions yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <SubscriptionsHeader
        active="channels"
        count={subscriptions.length}
        onVideosIntent={prefetchVideos}
        onChannelsIntent={prefetchChannels}
      />
      {query.isLoading ? (
        <VideoGridSkeleton idPrefix="subscription-channels" />
      ) : (
        <SubscriptionChannelList subscriptions={subscriptions} />
      )}
    </div>
  );
}

export const Route = createFileRoute("/subscriptions_/channels")({
  component: SubscriptionChannelsPage,
});
