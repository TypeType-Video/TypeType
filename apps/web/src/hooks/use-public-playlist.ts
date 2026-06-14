import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPublicPlaylist } from "../lib/api";
import { mapVideoItem } from "../lib/mappers";
import type { PublicPlaylistInfo } from "../types/playlist";
import type { VideoStream } from "../types/stream";

type PublicPlaylistPage = {
  playlist: PublicPlaylistInfo;
  streams: VideoStream[];
  nextpage: string | null;
};

export function usePublicPlaylist(url: string) {
  return useInfiniteQuery({
    queryKey: ["public-playlist", url],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const response = await fetchPublicPlaylist(url, pageParam);
      return {
        playlist: response.playlist,
        streams: response.videos.map(mapVideoItem),
        nextpage: response.nextpage,
      } satisfies PublicPlaylistPage;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: PublicPlaylistPage) => last.nextpage ?? undefined,
    enabled: url.length > 0,
  });
}
