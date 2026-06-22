import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchSearch } from "../lib/api-discovery";
import { mapVideoItem } from "../lib/mappers";
import type { ChannelResultItem } from "../types/api";
import type { PublicPlaylistInfo } from "../types/playlist";
import type { VideoStream } from "../types/stream";

type SearchPage = {
  streams: VideoStream[];
  channels: ChannelResultItem[];
  playlists: PublicPlaylistInfo[];
  nextpage: string | null;
  searchSuggestion: string | null;
  isCorrectedSearch: boolean;
};

export function useSearch(q: string, service: number, contentFilter?: string, sortFilter?: string) {
  return useInfiniteQuery({
    queryKey: ["search", q, service, contentFilter ?? "", sortFilter ?? ""],
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      const response = await fetchSearch(q, service, pageParam, contentFilter, sortFilter);
      return {
        streams: response.items.map(mapVideoItem),
        channels: response.channels ?? [],
        playlists: response.playlists ?? [],
        nextpage: response.nextpage,
        searchSuggestion: response.searchSuggestion,
        isCorrectedSearch: response.isCorrectedSearch,
      } satisfies SearchPage;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: SearchPage) => {
      const isEmpty =
        last.streams.length === 0 && last.channels.length === 0 && last.playlists.length === 0;
      return isEmpty ? undefined : (last.nextpage ?? undefined);
    },
    enabled: q.length > 0,
  });
}
