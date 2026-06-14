import type { PublicPlaylistInfo } from "../types/playlist";
import type { VideoStream } from "../types/stream";
import { PublicPlaylistCard } from "./public-playlist-card";
import { VideoCard } from "./video-card";

export type SearchResultItem =
  | { kind: "video"; stream: VideoStream }
  | { kind: "playlist"; playlist: PublicPlaylistInfo };

type Props = {
  items: SearchResultItem[];
};

export function SearchResultsGrid({ items }: Props) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.kind === "video" ? item.stream.id : item.playlist.url}
          className="animate-card-pop-in"
          style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
        >
          {item.kind === "video" ? (
            <VideoCard stream={item.stream} />
          ) : (
            <PublicPlaylistCard playlist={item.playlist} />
          )}
        </div>
      ))}
    </div>
  );
}
