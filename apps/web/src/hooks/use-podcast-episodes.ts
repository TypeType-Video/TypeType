import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPodcastEpisodes } from "../lib/api";
import { mapVideoItem } from "../lib/mappers";
import type { PodcastItem } from "../types/api";
import type { VideoStream } from "../types/stream";

type PodcastEpisodesPage = {
  podcast: PodcastItem;
  episodes: VideoStream[];
  nextpage: string | null;
};

export function usePodcastEpisodes(podcastUrl: string) {
  return useInfiniteQuery({
    queryKey: ["podcast-episodes", podcastUrl],
    enabled: podcastUrl.trim().length > 0,
    queryFn: async ({ pageParam }): Promise<PodcastEpisodesPage> => {
      const res = await fetchPodcastEpisodes(podcastUrl, pageParam as string | undefined);
      return {
        podcast: res.podcast,
        episodes: res.episodes.map(mapVideoItem),
        nextpage: res.nextpage,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextpage ?? undefined,
  });
}
