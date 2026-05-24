import { useQuery } from "@tanstack/react-query";
import { fetchWatchLater } from "../lib/api-collections";
import { mapWatchLaterItem } from "../lib/watch-later-mappers";
import { useAuth } from "./use-auth";

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
    isLoading: query.isLoading,
  };
}
