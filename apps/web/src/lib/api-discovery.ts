import type { ChannelResponse, SearchFiltersResponse, SearchPageResponse } from "../types/api";
import { request } from "./api";
import { API_BASE as BASE } from "./env";
import { optionalBearer } from "./optional-bearer";

export type ChannelSort = "latest" | "popular" | "oldest";

export function fetchSearchFilters(service: number): Promise<SearchFiltersResponse> {
  return request(`${BASE}/search/filters?service=${service}`);
}

export function fetchSearch(
  q: string,
  service: number,
  nextpage?: string,
  contentFilter?: string,
  sortFilter?: string,
): Promise<SearchPageResponse> {
  const params = new URLSearchParams({ q, service: String(service) });
  if (nextpage) params.set("nextpage", nextpage);
  if (contentFilter) params.set("contentFilter", contentFilter);
  if (sortFilter) params.set("sortFilter", sortFilter);
  return request(`${BASE}/search?${params}`, optionalBearer());
}

export function fetchChannel(
  url: string,
  nextpage?: string,
  sort?: ChannelSort,
): Promise<ChannelResponse> {
  return request(
    `${BASE}/channel/page`,
    optionalBearer({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, nextpage: nextpage ?? null, sort: sort ?? null }),
    }),
  );
}
