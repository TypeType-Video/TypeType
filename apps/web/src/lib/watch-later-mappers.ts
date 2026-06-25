import type { VideoStream } from "../types/stream";
import type { WatchLaterItem } from "../types/user";
import { proxyImage } from "./proxy";

export function mapWatchLaterItem(item: WatchLaterItem): VideoStream {
  const rawChannelAvatar = item.channelAvatar ?? "";
  return {
    id: item.url,
    title: item.title,
    thumbnail: proxyImage(item.thumbnail),
    rawThumbnail: item.thumbnail,
    rawChannelAvatar,
    channelName: item.channelName ?? "",
    channelUrl: item.channelUrl || undefined,
    channelAvatar: proxyImage(rawChannelAvatar),
    views: item.viewCount ?? 0,
    duration: item.duration,
    publishedAt: item.publishedAt && item.publishedAt > 0 ? item.publishedAt : undefined,
  };
}
