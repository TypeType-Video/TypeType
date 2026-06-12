import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChannelPageContent } from "../components/channel-page-content";
import type { ChannelSort } from "../lib/api";
import { channelPathSearch, toChannelSourceUrl } from "../lib/channel-route-url";
import { channelSortOrDefault } from "../lib/channel-sort";

type ChannelPathRouteSearch = { sort?: ChannelSort; q?: string; tab?: "live" };

function validateChannelPathSearch(search: Record<string, unknown>): ChannelPathRouteSearch {
  const sort = channelSortOrDefault(search.sort);
  const query = typeof search.q === "string" ? search.q.trim() : "";
  const live = search.tab === "live";
  return channelPathSearch(sort, query, live);
}

function ChannelPathPage() {
  const { channelId } = Route.useParams();
  const { sort: searchSort, q } = Route.useSearch();
  const sort = searchSort ?? "latest";
  const searchQuery = q ?? "";
  const live = Route.useSearch().tab === "live";
  const sourceUrl = toChannelSourceUrl(channelId);
  const navigate = useNavigate({ from: "/channel/$channelId" });

  return (
    <ChannelPageContent
      sourceUrl={sourceUrl}
      sort={sort}
      searchQuery={searchQuery}
      live={live}
      onNavigate={(nextSort, nextQuery, nextLive) =>
        navigate({ search: channelPathSearch(nextSort, nextQuery, nextLive), replace: true })
      }
    />
  );
}

export const Route = createFileRoute("/channel_/$channelId")({
  validateSearch: validateChannelPathSearch,
  component: ChannelPathPage,
});
