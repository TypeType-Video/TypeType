import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChannelAvatar } from "../components/channel-avatar";
import { ChannelPodcastsSection } from "../components/channel-podcasts-section";
import { PageSpinner } from "../components/page-spinner";
import { ScrollSentinel } from "../components/scroll-sentinel";
import { VideoCard } from "../components/video-card";
import { VerifiedBadgeIcon } from "../components/watch-icons";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import { useChannel } from "../hooks/use-channel";
import { useSubscriptions } from "../hooks/use-subscriptions";
import { ApiError, type ChannelSort } from "../lib/api";
import { formatViews } from "../lib/format";

const CHANNEL_SORT_OPTIONS: { value: ChannelSort; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "oldest", label: "Oldest" },
];

function toChannelSort(value: unknown): ChannelSort | undefined {
  if (value === "latest" || value === "popular" || value === "oldest") return value;
  return undefined;
}

function validateChannelSearch(search: Record<string, unknown>) {
  const url = typeof search.url === "string" ? search.url : "";
  const sort = toChannelSort(search.sort);
  return sort ? { url, sort } : { url };
}

function ChannelPage() {
  const { url, sort: searchSort } = Route.useSearch();
  const sort = searchSort ?? "latest";
  const navigate = useNavigate({ from: "/channel" });
  const {
    meta,
    videos,
    isLoading,
    isError,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useChannel(url, searchSort);
  const { add, remove, isSubscribed } = useSubscriptions();
  const { filter } = useBlockedFilter();

  const subscribed = isSubscribed(url);

  function handleSubscribe() {
    if (!meta) return;
    if (subscribed) {
      remove.mutate(url);
    } else {
      add.mutate({ channelUrl: url, name: meta.name, avatarUrl: meta.avatarUrl });
    }
  }

  function selectSort(nextSort: ChannelSort) {
    navigate({ search: { url, sort: nextSort }, replace: true });
  }

  if (isLoading) return <PageSpinner />;
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
      <label className="flex w-fit items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-fg-muted">
        Sort
        <select
          value={sort}
          onChange={(event) => selectSort(toChannelSort(event.target.value) ?? "latest")}
          className="bg-transparent text-sm font-medium text-fg outline-none"
        >
          {CHANNEL_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
        {filter(videos).map((v, index) => (
          <div
            key={v.id}
            className="animate-card-pop-in"
            style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
          >
            <VideoCard stream={v} />
          </div>
        ))}
      </div>
      <ScrollSentinel onIntersect={fetchNextPage} enabled={hasNextPage && !isFetchingNextPage} />
    </div>
  );
}

export const Route = createFileRoute("/channel")({
  validateSearch: validateChannelSearch,
  component: ChannelPage,
});
