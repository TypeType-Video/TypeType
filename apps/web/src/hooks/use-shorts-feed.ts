import { useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchSearch } from "../lib/api-discovery";
import { fetchShortsRecommendations, type RecommendationIntent } from "../lib/api-recommendations";
import { fetchSubscriptionShorts } from "../lib/api-user";
import type { VideoStream } from "../types/stream";
import {
  blendRecommendationsWithSubscriptions,
  dedupeShorts,
  fromDiscovery,
  fromRecommendations,
  fromSubscriptions,
  interleaveByChannel,
  parseNextPage,
} from "./shorts-feed-utils";
import { useAuth } from "./use-auth";
import { useBlockedFilter } from "./use-blocked-filter";
import { useSettings } from "./use-settings";

type ShortsFeed = {
  shorts: VideoStream[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
};
const SHORTS_QUERY = "shorts";

export function useShortsFeed(): ShortsFeed {
  const { authReady, isAuthed } = useAuth();
  const { settings } = useSettings();
  const { filter } = useBlockedFilter();
  const intent: RecommendationIntent = "auto";

  const recommendations = useInfiniteQuery({
    queryKey: ["shorts-recommendations", settings.defaultService, intent],
    queryFn: ({ pageParam }) =>
      fetchShortsRecommendations(
        settings.defaultService,
        30,
        pageParam as string | undefined,
        intent,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
    enabled: authReady && isAuthed && !settings.hideShorts,
    staleTime: 5 * 60 * 1000,
  });

  const recommendationShorts = useMemo(
    () => fromRecommendations(recommendations.data?.pages),
    [recommendations.data],
  );
  const hasRecommendationShorts = recommendationShorts.length > 0;

  const fallbackSubscriptions = useInfiniteQuery({
    queryKey: ["shorts-subscriptions-fallback", settings.defaultService],
    queryFn: ({ pageParam }) =>
      fetchSubscriptionShorts(pageParam as number, 30, settings.defaultService, true),
    initialPageParam: 0,
    getNextPageParam: (last) => parseNextPage(last.nextpage),
    enabled:
      authReady &&
      isAuthed &&
      !settings.hideShorts &&
      recommendations.isSuccess &&
      !hasRecommendationShorts,
    staleTime: 5 * 60 * 1000,
  });

  const discovery = useInfiniteQuery({
    queryKey: ["shorts-discovery", settings.defaultService],
    queryFn: ({ pageParam }) =>
      fetchSearch(SHORTS_QUERY, settings.defaultService, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextpage ?? undefined,
    enabled: authReady && !isAuthed && !settings.hideShorts,
    staleTime: 90 * 1000,
  });

  const shorts = useMemo(() => {
    const fallbackShorts = fromSubscriptions(fallbackSubscriptions.data?.pages);
    const merged = isAuthed
      ? hasRecommendationShorts
        ? blendRecommendationsWithSubscriptions(recommendationShorts, fallbackShorts)
        : fallbackShorts
      : fromDiscovery(discovery.data?.pages);
    return filter(interleaveByChannel(dedupeShorts(merged)));
  }, [
    isAuthed,
    hasRecommendationShorts,
    recommendationShorts,
    fallbackSubscriptions.data,
    discovery.data,
    filter,
  ]);

  const useRecommendations = authReady && isAuthed && hasRecommendationShorts;
  return {
    shorts,
    isLoading: settings.hideShorts
      ? false
      : shorts.length > 0
        ? false
        : isAuthed
          ? recommendations.isLoading
          : discovery.isLoading,
    isFetchingNextPage: isAuthed
      ? useRecommendations
        ? recommendations.isFetchingNextPage
        : fallbackSubscriptions.isFetchingNextPage
      : discovery.isFetchingNextPage,
    hasNextPage: isAuthed
      ? useRecommendations
        ? recommendations.hasNextPage
        : fallbackSubscriptions.hasNextPage
      : discovery.hasNextPage,
    fetchNextPage: () => {
      if (isAuthed) {
        if (useRecommendations && recommendations.hasNextPage) {
          void recommendations.fetchNextPage();
          return;
        }
        if (!useRecommendations && fallbackSubscriptions.hasNextPage)
          void fallbackSubscriptions.fetchNextPage();
        return;
      }
      if (discovery.hasNextPage) void discovery.fetchNextPage();
    },
  };
}
