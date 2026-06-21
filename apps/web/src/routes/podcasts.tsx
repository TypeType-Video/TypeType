import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { ChannelAvatar } from "../components/channel-avatar";
import { PageSpinner } from "../components/page-spinner";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { VideoGrid } from "../components/video-grid";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { usePodcastEpisodes } from "../hooks/use-podcast-episodes";
import { ApiError } from "../lib/api";
import { proxyImage } from "../lib/proxy";

function PodcastsPage() {
  const { url, avatar } = Route.useSearch();
  const query = usePodcastEpisodes(url);
  const firstPage = query.data?.pages[0];
  const podcast = firstPage?.podcast;
  const { filter } = useBlockedFilter();
  const rawEpisodes = useMemo(
    () => query.data?.pages.flatMap((page) => page.episodes) ?? [],
    [query.data],
  );
  const channelAvatar =
    avatar || rawEpisodes.find((episode) => episode.channelAvatar)?.channelAvatar || "";
  const episodes = useMemo(
    () =>
      filter(
        rawEpisodes.map((episode) =>
          episode.channelAvatar || !channelAvatar
            ? episode
            : { ...episode, channelAvatar, rawChannelAvatar: channelAvatar },
        ),
      ),
    [filter, rawEpisodes, channelAvatar],
  );

  if (url.trim().length === 0) {
    return <p className="text-sm text-fg-muted">No podcast selected.</p>;
  }

  if (query.isLoading) return <PageSpinner />;

  if (query.isError) {
    const message =
      query.error instanceof ApiError ? query.error.message : "Unable to load podcast episodes.";
    return (
      <div className="flex max-w-xl flex-col gap-3 rounded-xl border border-border bg-surface p-6">
        <p className="text-sm text-fg">{message}</p>
        <button
          type="button"
          onClick={() => query.refetch()}
          className="h-9 w-fit rounded-md bg-fg px-3 text-xs font-medium text-app hover:bg-fg-strong"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {podcast && (
        <header className="flex items-center gap-4">
          <img
            src={proxyImage(podcast.thumbnailUrl)}
            alt=""
            className="h-20 w-20 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-fg-soft">
              {channelAvatar && (
                <ChannelAvatar
                  src={channelAvatar}
                  name={podcast.uploaderName}
                  className="h-5 w-5"
                />
              )}
              Podcast
            </p>
            <h1 className="line-clamp-2 text-lg font-semibold text-fg">{podcast.title}</h1>
            <p className="mt-1 text-sm text-fg-muted">{podcast.uploaderName}</p>
          </div>
        </header>
      )}
      {episodes.length === 0 ? (
        <p className="text-sm text-fg-muted">No episodes found.</p>
      ) : (
        <VideoGrid streams={episodes} />
      )}
      <ScrollSentinel
        onIntersect={query.fetchNextPage}
        enabled={Boolean(query.hasNextPage) && !query.isFetchingNextPage}
      />
    </div>
  );
}

export const Route = createFileRoute("/podcasts")({
  validateSearch: (search: Record<string, unknown>) => ({
    url: typeof search.url === "string" ? search.url : "",
    avatar: typeof search.avatar === "string" ? search.avatar : undefined,
  }),
  component: PodcastsPage,
});
