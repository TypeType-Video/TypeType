import type { VideoStream } from "../types/stream";
import type { WatchLaterItem } from "../types/user";
import { proxyImage } from "./proxy";

export function mapWatchLaterItem(item: WatchLaterItem): VideoStream {
  return {
    id: item.url,
    title: item.title,
    thumbnail: proxyImage(item.thumbnail),
    rawThumbnail: item.thumbnail,
    rawChannelAvatar: "",
    channelName: "",
    channelAvatar: "",
    views: 0,
    duration: item.duration,
    publishedAt: item.addedAt > 0 ? item.addedAt : undefined,
  };
}
