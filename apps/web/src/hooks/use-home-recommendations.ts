import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchHomeRecommendations, type RecommendationIntent } from "../lib/api-recommendations";
import { mapVideoItem } from "../lib/mappers";
import type { VideoStream } from "../types/stream";
import { useAuth } from "./use-auth";
import { useSettings } from "./use-settings";

const PAGE_SIZE = 30;

type Result = {
  streams: VideoStream[];
  serviceId: number;
  intent: RecommendationIntent;
  isLoading: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
};

export function useHomeRecommendations(): Result {
  const { authReady, isAuthed } = useAuth();
  const { settings } = useSettings();
  const intent: RecommendationIntent = "auto";
  const query = useInfiniteQuery({
    queryKey: ["home-recommendations", "v2", settings.defaultService, intent],
    queryFn: ({ pageParam }) =>
      fetchHomeRecommendations(
        settings.defaultService,
        PAGE_SIZE,
        pageParam as string | undefined,
        intent,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.hasMore ? (last.nextCursor ?? undefined) : undefined),
    enabled: authReady && isAuthed && !settings.hideHomeRecommendations,
    staleTime: 90 * 1000,
  });

  const streams = (query.data?.pages ?? []).flatMap((page) => page.items).map(mapVideoItem);

  return {
    streams,
    serviceId: settings.defaultService,
    intent,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
