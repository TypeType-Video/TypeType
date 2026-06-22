import { useMemo } from "react";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useHomeRecommendations } from "../hooks/use-home-recommendations";
import { useSettings } from "../hooks/use-settings";
import { FamilyListEmptyState } from "./family-list-empty-state";
import { HomeFallbackSection } from "./home-fallback-section";
import { ScrollSentinel } from "./scroll-sentinel";
import { VideoGrid } from "./video-grid";
import { VideoGridSkeleton } from "./video-grid-skeleton";

export function HomeRecommendationsSection() {
  const { streams, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useHomeRecommendations();
  const { settings } = useSettings();
  const { filter } = useBlockedFilter();
  const filtered = useMemo(() => filter(streams), [filter, streams]);

  if (isLoading) return <VideoGridSkeleton idPrefix="home-recommendations" />;
  if (isError || filtered.length === 0) {
    if (settings.accessMode === "allow_list") {
      return <FamilyListEmptyState title="No family recommendations yet" />;
    }
    return <HomeFallbackSection />;
  }
  return (
    <>
      <VideoGrid streams={filtered} />
      {isFetchingNextPage && <VideoGridSkeleton idPrefix="home-recommendations-next" />}
      <ScrollSentinel onIntersect={fetchNextPage} enabled={hasNextPage && !isFetchingNextPage} />
    </>
  );
}
