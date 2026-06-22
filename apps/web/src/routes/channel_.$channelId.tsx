import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChannelPageContent } from "../components/channel-page-content";
import type { ChannelSort } from "../lib/api-discovery";
import {
  channelPathSearch,
  channelTabOrDefault,
  toChannelSourceUrl,
} from "../lib/channel-route-url";
import { channelSortOrDefault } from "../lib/channel-sort";

type ChannelPathRouteSearch = { sort?: ChannelSort; q?: string; tab?: "live" | "playlists" };

function validateChannelPathSearch(search: Record<string, unknown>): ChannelPathRouteSearch {
  const sort = channelSortOrDefault(search.sort);
  const query = typeof search.q === "string" ? search.q.trim() : "";
  const tab = channelTabOrDefault(search.tab);
  return channelPathSearch(sort, query, tab);
}

function ChannelPathPage() {
  const { channelId } = Route.useParams();
  const { sort: searchSort, q } = Route.useSearch();
  const sort = searchSort ?? "latest";
  const searchQuery = q ?? "";
  const tab = channelTabOrDefault(Route.useSearch().tab);
  const sourceUrl = toChannelSourceUrl(channelId);
  const navigate = useNavigate({ from: "/channel/$channelId" });

  return (
    <ChannelPageContent
      sourceUrl={sourceUrl}
      sort={sort}
      searchQuery={searchQuery}
      tab={tab}
      onNavigate={(nextSort, nextQuery, nextTab) =>
        navigate({ search: channelPathSearch(nextSort, nextQuery, nextTab), replace: true })
      }
    />
  );
}

export const Route = createFileRoute("/channel_/$channelId")({
  validateSearch: validateChannelPathSearch,
  component: ChannelPathPage,
});
