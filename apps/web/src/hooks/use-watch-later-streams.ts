import { useQuery } from "@tanstack/react-query";
import { fetchWatchLater } from "../lib/api-collections";
import { mapWatchLaterItem } from "../lib/watch-later-mappers";
import type { PlaylistVideoItem, WatchLaterItem } from "../types/user";
import { useAuth } from "./use-auth";

function mapWatchLaterPlaylistItem(item: WatchLaterItem, position: number): PlaylistVideoItem {
  return {
    id: item.url,
    url: item.url,
    title: item.title,
    thumbnail: item.thumbnail,
    channelName: item.channelName ?? "",
    channelUrl: item.channelUrl ?? "",
    channelAvatar: item.channelAvatar ?? "",
    viewCount: item.viewCount ?? 0,
    duration: item.duration,
    position,
    addedAt: item.addedAt,
    publishedAt: item.publishedAt,
    watchPosition: 0,
    watched: false,
    progressUpdatedAt: 0,
  };
}

export function useWatchLaterStreams() {
  const { authReady, isAuthed } = useAuth();
  const query = useQuery({
    queryKey: ["watch-later"],
    queryFn: fetchWatchLater,
    enabled: authReady && isAuthed,
  });
  const items = query.data ?? [];

  return {
    count: items.length,
    videos: items.map(mapWatchLaterItem),
    playlistVideos: items.map(mapWatchLaterPlaylistItem),
    isLoading: query.isLoading,
  };
}
