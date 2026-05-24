import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPodcasts } from "../lib/api";
import { mapVideoItem } from "../lib/mappers";
import type { PodcastItem } from "../types/api";
import type { VideoStream } from "../types/stream";

type PodcastPage = {
  channelName: string;
  channelUrl: string;
  podcasts: PodcastItem[];
  episodes: VideoStream[];
  nextpage: string | null;
};

export function usePodcasts(channelUrl: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["podcasts", channelUrl],
    enabled: enabled && channelUrl.trim().length > 0,
    queryFn: async ({ pageParam }): Promise<PodcastPage> => {
      const res = await fetchPodcasts(channelUrl, pageParam as string | undefined);
      return {
        channelName: res.channelName,
        channelUrl: res.channelUrl,
        podcasts: res.podcasts,
        episodes: res.episodes.map(mapVideoItem),
        nextpage: res.nextpage,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextpage ?? undefined,
  });
}
