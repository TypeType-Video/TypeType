import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ChannelPageContent } from "../components/channel-page-content";
import { PageSpinner } from "../components/page-spinner";
import type { ChannelSort } from "../lib/api";
import {
  channelLegacySearch,
  channelPathSearch,
  toChannelPathParam,
  toChannelSourceUrl,
} from "../lib/channel-route-url";
import { splitChannelSearchUrl } from "../lib/channel-search-url";
import { channelSortOrDefault } from "../lib/channel-sort";

type ChannelRouteSearch = { url: string; sort?: ChannelSort; q?: string; tab?: "live" };

function validateChannelSearch(search: Record<string, unknown>): ChannelRouteSearch {
  const rawUrl = typeof search.url === "string" ? search.url : "";
  const parsed = splitChannelSearchUrl(toChannelSourceUrl(rawUrl));
  const sort = channelSortOrDefault(search.sort);
  const query = typeof search.q === "string" ? search.q.trim() : parsed.query;
  const live = search.tab === "live";
  return channelLegacySearch(parsed.channelUrl, sort, query, live);
}

function LegacyChannelPage() {
  const { url, sort: searchSort, q } = Route.useSearch();
  const sort = searchSort ?? "latest";
  const searchQuery = q ?? "";
  const live = Route.useSearch().tab === "live";
  const sourceUrl = toChannelSourceUrl(url);
  const channelId = toChannelPathParam(sourceUrl);
  const navigate = useNavigate({ from: "/channel" });

  useEffect(() => {
    if (!channelId) return;
    navigate({
      to: "/channel/$channelId",
      params: { channelId },
      search: channelPathSearch(sort, searchQuery, live),
      replace: true,
    });
  }, [channelId, live, navigate, searchQuery, sort]);

  if (channelId) return <PageSpinner />;

  return (
    <ChannelPageContent
      sourceUrl={sourceUrl}
      sort={sort}
      searchQuery={searchQuery}
      live={live}
      onNavigate={(nextSort, nextQuery, nextLive) =>
        navigate({
          search: channelLegacySearch(sourceUrl, nextSort, nextQuery, nextLive),
          replace: true,
        })
      }
    />
  );
}

export const Route = createFileRoute("/channel")({
  validateSearch: validateChannelSearch,
  component: LegacyChannelPage,
});
