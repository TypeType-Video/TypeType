import { usePodcasts } from "../hooks/use-podcasts";
import { detectProvider } from "../lib/provider";
import { PodcastCard } from "./podcast-card";

const SKELETON_KEYS = [
  "podcast-skeleton-1",
  "podcast-skeleton-2",
  "podcast-skeleton-3",
  "podcast-skeleton-4",
];

type Props = {
  channelUrl: string;
  channelAvatar?: string;
};

export function ChannelPodcastsSection({ channelUrl, channelAvatar }: Props) {
  const isYoutube = detectProvider(channelUrl) === "youtube";
  const query = usePodcasts(channelUrl, isYoutube);
  const podcasts = query.data?.pages.flatMap((page) => page.podcasts) ?? [];

  if (!isYoutube || query.isError || (query.isFetched && podcasts.length === 0)) return null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-fg-soft">Podcasts</p>
          <p className="text-xs text-fg-muted">Podcast playlists from this channel</p>
        </div>
        {query.hasNextPage && (
          <button
            type="button"
            onClick={() => query.fetchNextPage()}
            disabled={query.isFetchingNextPage}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-fg-muted hover:border-border-strong hover:text-fg disabled:opacity-60"
          >
            {query.isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        )}
      </div>
      {query.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {SKELETON_KEYS.map((key) => (
            <div key={key} className="aspect-square rounded-2xl bg-surface-strong" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {podcasts.map((podcast) => (
            <PodcastCard key={podcast.url} podcast={podcast} channelAvatar={channelAvatar} />
          ))}
        </div>
      )}
    </section>
  );
}
