import { useMemo } from "react";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useHomeRecommendations } from "../hooks/use-home-recommendations";
import { HomeFallbackSection } from "./home-fallback-section";
import { ScrollSentinel } from "./scroll-sentinel";
import { VideoGrid } from "./video-grid";
import { VideoGridSkeleton } from "./video-grid-skeleton";

export function HomeRecommendationsSection() {
  const { streams, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useHomeRecommendations();
  const { filter } = useBlockedFilter();
  const filtered = useMemo(() => filter(streams), [filter, streams]);

  if (isLoading) return <VideoGridSkeleton idPrefix="home-recommendations" />;
  if (isError || filtered.length === 0) return <HomeFallbackSection />;
  return (
    <>
      <VideoGrid streams={filtered} />
      {isFetchingNextPage && <VideoGridSkeleton idPrefix="home-recommendations-next" />}
      <ScrollSentinel onIntersect={fetchNextPage} enabled={hasNextPage && !isFetchingNextPage} />
    </>
  );
}
