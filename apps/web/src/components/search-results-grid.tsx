import type { ChannelResultItem } from "../types/api";
import type { PublicPlaylistInfo } from "../types/playlist";
import type { VideoStream } from "../types/stream";
import { PublicPlaylistCard } from "./public-playlist-card";
import { SearchChannelCard } from "./search-channel-card";
import { VideoCard } from "./video-card";

export type SearchResultItem =
  | { kind: "video"; stream: VideoStream }
  | { kind: "channel"; channel: ChannelResultItem }
  | { kind: "playlist"; playlist: PublicPlaylistInfo };

function itemKey(item: SearchResultItem): string {
  if (item.kind === "video") return item.stream.id;
  if (item.kind === "channel") return item.channel.url;
  return item.playlist.url;
}

function ItemCard({
  item,
  relatedStreams,
}: {
  item: SearchResultItem;
  relatedStreams: VideoStream[];
}) {
  if (item.kind === "video")
    return <VideoCard stream={item.stream} relatedStreams={relatedStreams} />;
  if (item.kind === "channel") return <SearchChannelCard channel={item.channel} />;
  return <PublicPlaylistCard playlist={item.playlist} />;
}

type Props = {
  items: SearchResultItem[];
};

export function SearchResultsGrid({ items }: Props) {
  const relatedStreams = items.flatMap((item) => (item.kind === "video" ? [item.stream] : []));
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={itemKey(item)}
          className="animate-card-pop-in"
          style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
        >
          <ItemCard item={item} relatedStreams={relatedStreams} />
        </div>
      ))}
    </div>
  );
}
