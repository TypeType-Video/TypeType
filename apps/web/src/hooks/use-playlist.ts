import { useQuery } from "@tanstack/react-query";
import { fetchPlaylist } from "../lib/api-playlists";

const KEY = ["playlists"];

export function usePlaylist(id: string) {
  return useQuery({
    queryKey: [...KEY, id],
    queryFn: () => fetchPlaylist(id),
    enabled: id.length > 0,
  });
}
