import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChannelPageContent } from "../components/channel-page-content";
import type { ChannelSort } from "../lib/api";
import { channelPathSearch, toChannelSourceUrl } from "../lib/channel-route-url";
import { channelSortOrDefault } from "../lib/channel-sort";

type ChannelPathRouteSearch = { sort?: ChannelSort; q?: string };

function validateChannelPathSearch(search: Record<string, unknown>): ChannelPathRouteSearch {
  const sort = channelSortOrDefault(search.sort);
  const query = typeof search.q === "string" ? search.q.trim() : "";
  return channelPathSearch(sort, query);
}

function ChannelPathPage() {
  const { channelId } = Route.useParams();
  const { sort: searchSort, q } = Route.useSearch();
  const sort = searchSort ?? "latest";
  const searchQuery = q ?? "";
  const sourceUrl = toChannelSourceUrl(channelId);
  const navigate = useNavigate({ from: "/channel/$channelId" });

  return (
    <ChannelPageContent
      sourceUrl={sourceUrl}
      sort={sort}
      searchQuery={searchQuery}
      onNavigate={(nextSort, nextQuery) =>
        navigate({ search: channelPathSearch(nextSort, nextQuery), replace: true })
      }
    />
  );
}

export const Route = createFileRoute("/channel_/$channelId")({
  validateSearch: validateChannelPathSearch,
  component: ChannelPathPage,
});
