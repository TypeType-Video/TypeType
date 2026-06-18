import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchFavorites } from "../lib/api-collections";
import { fetchStream } from "../lib/api-stream";
import { mapStreamResponse } from "../lib/mappers";
import type { VideoStream } from "../types/stream";
import { useAuth } from "./use-auth";

function isVideoStream(value: VideoStream | undefined): value is VideoStream {
  return value !== undefined;
}

type UseFavoriteStreamsOptions = {
  limit?: number;
};

export function useFavoriteStreams(options: UseFavoriteStreamsOptions = {}) {
  const { authReady, isAuthed } = useAuth();
  const favorites = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: authReady && isAuthed,
  });
  const items =
    options.limit === undefined
      ? (favorites.data ?? [])
      : (favorites.data ?? []).slice(0, options.limit);
  const streams = useQueries({
    queries: items.map((item) => ({
      queryKey: ["favorite-stream", item.videoUrl],
      queryFn: () =>
        fetchStream(item.videoUrl).then((res) => mapStreamResponse(res, item.videoUrl)),
      enabled: favorites.isSuccess,
    })),
  });

  return {
    count: favorites.data?.length ?? 0,
    requestedCount: items.length,
    videos: streams.map((query) => query.data).filter(isVideoStream),
    isLoading: favorites.isLoading || streams.some((query) => query.isLoading),
  };
}
