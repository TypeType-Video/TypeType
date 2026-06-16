import { Link } from "@tanstack/react-router";
import { proxyImage } from "../lib/proxy";
import type { PodcastItem } from "../types/api";

type Props = {
  podcast: PodcastItem;
  channelAvatar?: string;
};

export function PodcastCard({ podcast, channelAvatar }: Props) {
  const thumbnail = proxyImage(podcast.thumbnailUrl);
  const count = podcast.streamCount === 1 ? "1 episode" : `${podcast.streamCount} episodes`;

  return (
    <Link
      to="/podcasts"
      search={{ url: podcast.url, avatar: channelAvatar }}
      className="group flex flex-col gap-2"
    >
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-surface-strong">
        <img
          src={thumbnail}
          alt={podcast.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        {channelAvatar && (
          <img
            src={channelAvatar}
            alt=""
            className="absolute bottom-2 left-2 h-8 w-8 rounded-full border border-black/50 bg-surface object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
      <div className="min-w-0 px-1">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-fg group-hover:text-fg-strong">
          {podcast.title}
        </p>
        <p className="mt-1 truncate text-xs text-fg-muted">{podcast.uploaderName}</p>
        <p className="text-xs text-fg-soft">{count}</p>
      </div>
    </Link>
  );
}
