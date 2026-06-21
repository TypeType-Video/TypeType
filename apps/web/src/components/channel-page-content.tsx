import { useMemo } from "react";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useChannel } from "../hooks/use-channel";
import { useDocumentTitle } from "../hooks/use-document-title";
import { useSubscriptions } from "../hooks/use-subscriptions";
import { ApiError, type ChannelSort } from "../lib/api";
import type { ChannelTab } from "../lib/channel-route-url";
import { formatViews } from "../lib/format";
import { detectProvider } from "../lib/provider";
import { ChannelAvatar } from "./channel-avatar";
import { ChannelFilterBar } from "./channel-filter-bar";
import { ChannelPlaylistsSection } from "./channel-playlists-section";
import { ChannelPodcastsSection } from "./channel-podcasts-section";
import { PageSpinner } from "./page-spinner";
import { ScrollSentinel } from "./scroll-sentinel";
import { VideoCard } from "./video-card";
import { VideoGridSkeleton } from "./video-grid-skeleton";
import { VerifiedBadgeIcon } from "./watch-icons";

type Props = {
  sourceUrl: string;
  sort: ChannelSort;
  searchQuery: string;
  tab: ChannelTab;
  onNavigate: (sort: ChannelSort, query: string, tab: ChannelTab) => void;
};

export function ChannelPageContent({ sourceUrl, sort, searchQuery, tab, onNavigate }: Props) {
  const live = tab === "live";
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
  } = useChannel(sourceUrl, sort, searchQuery, live);
  const { add, remove, isSubscribed } = useSubscriptions();
  const { filter } = useBlockedFilter();
  useDocumentTitle(meta?.name);

  const subscribed = isSubscribed(sourceUrl);
  const searchAvailable = detectProvider(sourceUrl) === "youtube";
  const visibleVideos = useMemo(() => filter(videos), [filter, videos]);
  const isInitialLoading = isLoading && !meta;
  const isReplacingVideos = isFetching && !isFetchingNextPage && visibleVideos.length === 0;

  function handleSubscribe() {
    if (!meta) return;
    if (subscribed) {
      remove.mutate(sourceUrl);
    } else {
      add.mutate({ channelUrl: sourceUrl, name: meta.name, avatarUrl: meta.avatarUrl });
    }
  }

  function selectSort(nextSort: ChannelSort) {
    onNavigate(nextSort, searchQuery, tab);
  }

  function searchChannel(nextQuery: string) {
    onNavigate(sort, searchAvailable && tab === "videos" ? nextQuery : "", tab);
  }

  function selectTab(nextTab: ChannelTab) {
    onNavigate(sort, "", nextTab);
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
          className="h-9 w-fit rounded-md bg-fg px-3 text-xs font-medium text-app hover:bg-fg-strong"
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
                  : "bg-fg text-app hover:bg-fg-strong"
              }`}
            >
              {subscribed ? "Subscribed" : "Subscribe"}
            </button>
          </div>
        </div>
      )}
      {tab === "videos" && (
        <ChannelPodcastsSection channelUrl={sourceUrl} channelAvatar={meta?.avatarUrl} />
      )}
      <ChannelFilterBar
        sort={sort}
        query={searchQuery}
        tab={tab}
        searchAvailable={searchAvailable}
        onSearch={searchChannel}
        onTabChange={selectTab}
        onSortChange={selectSort}
      />
      {tab === "playlists" ? (
        <ChannelPlaylistsSection channelUrl={sourceUrl} />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
