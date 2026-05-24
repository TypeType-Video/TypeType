import { useQueries, useQuery } from "@tanstack/react-query";
import { fetchStream } from "../lib/api";
import { fetchFavorites } from "../lib/api-collections";
import { mapStreamResponse } from "../lib/mappers";
import type { VideoStream } from "../types/stream";
import { useAuth } from "./use-auth";

function isVideoStream(value: VideoStream | undefined): value is VideoStream {
  return value !== undefined;
}

export function useFavoriteStreams() {
  const { authReady, isAuthed } = useAuth();
  const favorites = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites,
    enabled: authReady && isAuthed,
  });
  const streams = useQueries({
    queries: (favorites.data ?? []).map((item) => ({
      queryKey: ["favorite-stream", item.videoUrl],
      queryFn: () =>
        fetchStream(item.videoUrl).then((res) => mapStreamResponse(res, item.videoUrl)),
      enabled: favorites.isSuccess,
    })),
  });

  return {
    count: favorites.data?.length ?? 0,
    videos: streams.map((query) => query.data).filter(isVideoStream),
    isLoading: favorites.isLoading || streams.some((query) => query.isLoading),
  };
}
