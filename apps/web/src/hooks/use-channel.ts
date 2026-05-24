import { useInfiniteQuery } from "@tanstack/react-query";
import type { ChannelSort } from "../lib/api";
import { fetchChannel } from "../lib/api";
import { mapVideoItem } from "../lib/mappers";
import { proxyImage } from "../lib/proxy";
import type { VideoStream } from "../types/stream";

type ChannelMeta = {
  name: string;
  description: string;
  avatarUrl: string;
  bannerUrl: string;
  subscriberCount: number;
  isVerified: boolean;
};

type ChannelPage = {
  meta: ChannelMeta | null;
  videos: VideoStream[];
  nextpage: string | null;
};

export function useChannel(channelUrl: string, sort?: ChannelSort) {
  const query = useInfiniteQuery({
    queryKey: ["channel", channelUrl, sort],
    queryFn: async ({ pageParam }): Promise<ChannelPage> => {
      const res = await fetchChannel(channelUrl, pageParam as string | undefined, sort);
      const isFirstPage = pageParam === undefined;
      return {
        meta: isFirstPage
          ? {
              name: res.name,
              description: res.description,
              avatarUrl: proxyImage(res.avatarUrl),
              bannerUrl: proxyImage(res.bannerUrl),
              subscriberCount: res.subscriberCount,
              isVerified: res.isVerified,
            }
          : null,
        videos: res.videos.map(mapVideoItem),
        nextpage: res.nextpage,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last: ChannelPage | undefined) => last?.nextpage ?? undefined,
    enabled: channelUrl.length > 0,
    placeholderData: (previousData) => previousData,
  });

  const pages = query.data?.pages ?? [];
  const meta = pages.find((p) => p.meta !== null)?.meta ?? null;
  const avatarUrl = meta?.avatarUrl ?? "";
  const videos = pages.flatMap((p) =>
    p.videos.map((v) => (v.channelAvatar || !avatarUrl ? v : { ...v, channelAvatar: avatarUrl })),
  );

  return { ...query, meta, videos };
}
