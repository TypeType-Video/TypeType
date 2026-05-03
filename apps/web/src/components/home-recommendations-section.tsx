import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useHomeRecommendations } from "../hooks/use-home-recommendations";
import { trackRecommendationEvent } from "../lib/recommendation-tracker";
import { HomeFallbackSection } from "./home-fallback-section";
import { ScrollSentinel } from "./scroll-sentinel";
import { VideoCardSkeleton } from "./video-card-skeleton";
import { VideoGrid } from "./video-grid";

const SKELETON_KEYS = Array.from({ length: 12 }, (_, i) => `hrs-${i}`);

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {SKELETON_KEYS.map((k) => (
        <VideoCardSkeleton key={k} />
      ))}
    </div>
  );
}

export function HomeRecommendationsSection() {
  const {
    streams,
    serviceId,
    intent,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useHomeRecommendations();
  const { filter } = useBlockedFilter();
  const filtered = filter(streams);

  if (isLoading) return <SkeletonGrid />;
  if (isError || filtered.length === 0) return <HomeFallbackSection />;
  return (
    <>
      <VideoGrid
        streams={filtered}
        onCardOpen={(stream) => {
          trackRecommendationEvent("click", stream, { serviceId, intent });
        }}
        onCardImpression={(stream) => {
          trackRecommendationEvent("impression", stream, { serviceId, intent });
        }}
      />
      <ScrollSentinel onIntersect={fetchNextPage} enabled={hasNextPage && !isFetchingNextPage} />
    </>
  );
}
