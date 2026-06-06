import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChannelAvatar } from "../components/channel-avatar";
import { ChannelFilterBar } from "../components/channel-filter-bar";
import { ChannelPodcastsSection } from "../components/channel-podcasts-section";
import { PageSpinner } from "../components/page-spinner";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { VideoCard } from "../components/video-card";
import { VideoGridSkeleton } from "../components/video-grid-skeleton";
import { VerifiedBadgeIcon } from "../components/watch-icons";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useChannel } from "../hooks/use-channel";
import { useSubscriptions } from "../hooks/use-subscriptions";
import { ApiError, type ChannelSort } from "../lib/api";
import { splitChannelSearchUrl } from "../lib/channel-search-url";
import { channelSortOrDefault } from "../lib/channel-sort";
import { formatViews } from "../lib/format";
import { detectProvider } from "../lib/provider";

type ChannelRouteSearch = { url: string; sort?: ChannelSort; q?: string };

function channelRouteSearch(url: string, sort: ChannelSort, query: string): ChannelRouteSearch {
  const q = query.trim();
  return q.length > 0 ? { url, sort, q } : { url, sort };
}

function validateChannelSearch(search: Record<string, unknown>) {
  const parsed = splitChannelSearchUrl(typeof search.url === "string" ? search.url : "");
  const query = typeof search.q === "string" ? search.q.trim() : parsed.query;
  return channelRouteSearch(parsed.channelUrl, channelSortOrDefault(search.sort), query);
}

function ChannelPage() {
  const { url, sort: searchSort, q } = Route.useSearch();
  const sort = searchSort ?? "latest";
  const searchQuery = q ?? "";
  const navigate = useNavigate({ from: "/channel" });
  const {
    meta,
    videos,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
  } = useChannel(url, sort, searchQuery);
  const { add, remove, isSubscribed } = useSubscriptions();
  const { filter } = useBlockedFilter();

  const subscribed = isSubscribed(url);
  const searchAvailable = detectProvider(url) === "youtube";
  const visibleVideos = filter(videos);
  const isInitialLoading = isLoading && !meta;
  const isReplacingVideos = isFetching && !isFetchingNextPage && visibleVideos.length === 0;

  function handleSubscribe() {
    if (!meta) return;
    if (subscribed) {
      remove.mutate(url);
    } else {
      add.mutate({ channelUrl: url, name: meta.name, avatarUrl: meta.avatarUrl });
    }
  }

  function selectSort(nextSort: ChannelSort) {
    navigate({ search: channelRouteSearch(url, nextSort, searchQuery), replace: true });
  }

  function searchChannel(nextQuery: string) {
    const query = searchAvailable ? nextQuery : "";
    navigate({ search: channelRouteSearch(url, sort, query), replace: true });
  }

  if (isInitialLoading) return <PageSpinner />;
  if (isError) {
    const message = error instanceof ApiError ? error.message : "Unable to load channel right now.";
    return (
      <div className="rounded-xl border border-border bg-surface p-6 flex flex-col gap-3 max-w-xl">
        <p className="text-sm text-fg">{message}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="h-9 w-fit rounded-md bg-fg px-3 text-xs font-medium text-app hover:bg-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {meta && (
        <div className="flex flex-col gap-4">
          {meta.bannerUrl && (
            <img src={meta.bannerUrl} alt="" className="w-full h-32 object-cover rounded-lg" />
          )}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ChannelAvatar src={meta.avatarUrl} name={meta.name} className="w-14 h-14" />
              <div className="flex flex-col">
                <h1 className="text-lg font-semibold text-fg flex items-center gap-1.5">
                  {meta.name}
                  {meta.isVerified && <VerifiedBadgeIcon />}
                </h1>
                <p className="text-sm text-fg-soft">
                  {formatViews(meta.subscriberCount)} subscribers
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSubscribe}
              aria-pressed={subscribed}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                subscribed
                  ? "ring-1 ring-border-strong bg-surface-strong text-fg hover:bg-surface-soft"
                  : "bg-fg text-app hover:bg-white"
              }`}
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>
        </div>
      )}
      <ChannelPodcastsSection channelUrl={url} channelAvatar={meta?.avatarUrl} />
      <ChannelFilterBar
        sort={sort}
        query={searchQuery}
        searchAvailable={searchAvailable}
        onSearch={searchChannel}
        onSortChange={selectSort}
      />
      {isReplacingVideos ? (
        <VideoGridSkeleton idPrefix="channel-replace" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
          {visibleVideos.map((v, index) => (
            <div
              key={v.id}
              className="animate-card-pop-in"
              style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
            >
              <VideoCard stream={v} />
            </div>
          ))}
        </div>
      )}
      {isFetchingNextPage && <VideoGridSkeleton idPrefix="channel-next" />}
      <ScrollSentinel
        onIntersect={fetchNextPage}
        enabled={hasNextPage && !isFetchingNextPage && !isReplacingVideos}
      />
    </div>
  );
}

export const Route = createFileRoute("/channel")({
  validateSearch: validateChannelSearch,
  component: ChannelPage,
});
