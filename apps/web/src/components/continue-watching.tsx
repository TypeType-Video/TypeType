import { useQueries } from "@tanstack/react-query";
import { useHistory } from "../hooks/use-history";
import { streamQueryOptions } from "../hooks/use-stream";
import { isVideoInProgress } from "../lib/watch-progress";
import { toWatchSourceUrl } from "../lib/watch-url";
import type { VideoStream } from "../types/stream";
import type { HistoryItem } from "../types/user";
import { ContinueCard } from "./continue-card";

const MAX_ITEMS = 12;

function withStreamMetadata(item: HistoryItem, stream: VideoStream | undefined): HistoryItem {
  if (!stream) return item;
  return {
    ...item,
    thumbnail: item.thumbnail || stream.rawThumbnail,
    channelName: item.channelName || stream.channelName,
    channelUrl: item.channelUrl || stream.channelUrl || "",
    channelAvatar: item.channelAvatar || stream.rawChannelAvatar,
    uploaderVerified: item.uploaderVerified ?? stream.uploaderVerified,
    duration: item.duration > 0 ? item.duration : stream.duration,
    publishedAt: item.publishedAt ?? stream.publishedAt,
    viewCount: item.viewCount ?? stream.views,
  };
}

export function ContinueWatching() {
  const { items } = useHistory();
  const displayed = items
    .filter((h) => isVideoInProgress(h.progress, h.duration))
    .sort((a, b) => b.watchedAt - a.watchedAt)
    .slice(0, MAX_ITEMS);
  const metadata = useQueries({
    queries: displayed.map((item) => {
      const sourceUrl = toWatchSourceUrl(item.url);
      return streamQueryOptions(sourceUrl, false, !item.publishedAt);
    }),
  });
  const enriched = displayed.map((item, index) => withStreamMetadata(item, metadata[index]?.data));

  if (displayed.length === 0) return null;

  return (
    <section className="mt-2 flex flex-col gap-3 sm:mt-3">
      <p className="text-xs font-medium text-fg-soft uppercase tracking-wider px-1">
        Continue watching
      </p>
      <div className="flex gap-3 overflow-x-auto pb-3">
        {enriched.map((item, index) => (
          <div
            key={item.id}
            className="animate-card-pop-in first:pl-0.5 sm:first:pl-0"
            style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
          >
            <ContinueCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
