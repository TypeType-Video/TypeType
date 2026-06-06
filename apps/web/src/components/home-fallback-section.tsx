import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useSubscriptionFeed } from "../hooks/use-subscription-feed";
import { useSubscriptions } from "../hooks/use-subscriptions";
import { ScrollSentinel } from "./scroll-sentinel";
import { VideoGrid } from "./video-grid";
import { VideoGridSkeleton } from "./video-grid-skeleton";

function FeedSection() {
  const { streams, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSubscriptionFeed();
  const { filter } = useBlockedFilter();
  if (isLoading) return <VideoGridSkeleton idPrefix="home-feed" />;
  return (
    <>
      <VideoGrid streams={filter(streams)} />
      {isFetchingNextPage && <VideoGridSkeleton idPrefix="home-feed-next" />}
      <ScrollSentinel onIntersect={fetchNextPage} enabled={hasNextPage && !isFetchingNextPage} />
    </>
  );
}

export function HomeFallbackSection() {
  const { query } = useSubscriptions();
  const hasSubs = (query.data ?? []).length > 0;
  if (query.isLoading) return <VideoGridSkeleton idPrefix="home-fallback" />;
  if (hasSubs) return <FeedSection />;
  return (
    <section className="rounded-xl border border-border bg-surface/70 p-6 text-center">
      <h2 className="text-sm font-semibold text-fg">No subscriptions yet</h2>
      <p className="mt-1 text-xs text-fg-muted">
        Subscribe to channels to unlock a personalized home feed.
      </p>
    </section>
  );
}
