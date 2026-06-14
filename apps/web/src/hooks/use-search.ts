import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSearch } from "../lib/api";
import { mapVideoItem } from "../lib/mappers";
import type { PublicPlaylistInfo } from "../types/playlist";
import type { VideoStream } from "../types/stream";

type SearchPage = {
  streams: VideoStream[];
  playlists: PublicPlaylistInfo[];
  nextpage: string | null;
  searchSuggestion: string | null;
  isCorrectedSearch: boolean;
};

export function useSearch(q: string, service: number) {
  return useInfiniteQuery({
    queryKey: ["search", q, service],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const response = await fetchSearch(q, service, pageParam);
      return {
        streams: response.items.map(mapVideoItem),
        playlists: response.playlists ?? [],
        nextpage: response.nextpage,
        searchSuggestion: response.searchSuggestion,
        isCorrectedSearch: response.isCorrectedSearch,
      } satisfies SearchPage;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: SearchPage) => last.nextpage ?? undefined,
    enabled: q.length > 0,
  });
}
