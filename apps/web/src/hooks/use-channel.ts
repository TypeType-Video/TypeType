import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import type { ChannelSort } from "../lib/api";
import { fetchChannel } from "../lib/api";
import { buildChannelRequestUrl } from "../lib/channel-search-url";
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

type CachedChannelMeta = {
  channelUrl: string;
  meta: ChannelMeta;
};

export function useChannel(
  channelUrl: string,
  sort: ChannelSort,
  searchQuery: string,
  live: boolean,
) {
  const lastMeta = useRef<CachedChannelMeta | null>(null);
  const requestUrl = buildChannelRequestUrl(channelUrl, searchQuery, live);
  const channelQuery = useInfiniteQuery({
    queryKey: ["channel", channelUrl, sort, searchQuery, live],
    queryFn: async ({ pageParam }): Promise<ChannelPage> => {
      const res = await fetchChannel(requestUrl, pageParam as string | undefined, sort);
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
  });

  const pages = channelQuery.data?.pages ?? [];
  const currentMeta = pages.find((p) => p.meta !== null)?.meta ?? null;
  const cachedMeta = lastMeta.current?.channelUrl === channelUrl ? lastMeta.current.meta : null;
  const meta = currentMeta ?? cachedMeta;
  const avatarUrl = meta?.avatarUrl ?? "";
  const videos = pages.flatMap((p) =>
    p.videos.map((v) => (v.channelAvatar || !avatarUrl ? v : { ...v, channelAvatar: avatarUrl })),
  );

  useEffect(() => {
    if (currentMeta) lastMeta.current = { channelUrl, meta: currentMeta };
  }, [channelUrl, currentMeta]);

  return { ...channelQuery, meta, videos };
}
