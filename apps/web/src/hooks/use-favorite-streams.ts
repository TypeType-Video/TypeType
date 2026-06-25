import { useQuery } from "@tanstack/react-query";
import { fetchFavorites } from "../lib/api-collections";
import { proxyImage } from "../lib/proxy";
import type { VideoStream } from "../types/stream";
import type { FavoriteItem } from "../types/user";
import { useAuth } from "./use-auth";

type UseFavoriteStreamsOptions = {
  limit?: number;
};

function mapFavoriteItem(item: FavoriteItem): VideoStream {
  const rawThumbnail = item.thumbnail ?? "";
  const rawChannelAvatar = item.channelAvatar ?? "";
  return {
    id: item.videoUrl,
    title: item.title ?? "",
    thumbnail: proxyImage(rawThumbnail),
    rawThumbnail,
    rawChannelAvatar,
    channelName: item.channelName ?? "",
    channelUrl: item.channelUrl || undefined,
    channelAvatar: proxyImage(rawChannelAvatar),
    views: item.viewCount ?? 0,
    duration: item.duration ?? 0,
    publishedAt: item.publishedAt && item.publishedAt > 0 ? item.publishedAt : undefined,
  };
}

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

  return {
    count: favorites.data?.length ?? 0,
    requestedCount: items.length,
    videos: items.map(mapFavoriteItem),
    isLoading: favorites.isLoading,
  };
}
