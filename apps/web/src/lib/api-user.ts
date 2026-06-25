import type { SubscriptionFeedPage } from "../types/api";
import type { HistoryItem, SearchHistoryItem, SettingsItem, SubscriptionItem } from "../types/user";
import { ApiError } from "./api";
import { authed, authedJson } from "./authed";
import { channelUrlVariants, normalizeChannelUrl } from "./channel-url";
import { API_BASE as BASE } from "./env";
import { normalizeApiPayload } from "./text-normalize";

type HistoryParams = {
  q?: string;
  from?: number;
  to?: number;
  limit?: number;
  offset?: number;
};

type HistoryPage = {
  items: HistoryItem[];
  total: number;
};

type SearchHistoryPage = {
  items: SearchHistoryItem[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchHistory(params: HistoryParams = {}): Promise<HistoryPage> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.from !== undefined) search.set("from", String(params.from));
  if (params.to !== undefined) search.set("to", String(params.to));
  if (params.limit !== undefined) search.set("limit", String(params.limit));
  if (params.offset !== undefined) search.set("offset", String(params.offset));
  const qs = search.toString();
  const res = await authed(`${BASE}/history${qs ? `?${qs}` : ""}`);
  const body = await res.json();
  if (!res.ok) throw new ApiError((body as { error: string }).error, res.status);
  const total = Number(res.headers.get("X-Total-Count") ?? 0);
  return { items: body as HistoryItem[], total };
}

export async function addHistory(item: Omit<HistoryItem, "id" | "watchedAt">): Promise<void> {
  await authed(`${BASE}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
}

export async function removeHistory(id: string): Promise<void> {
  const res = await authed(`${BASE}/history/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new ApiError("Failed to remove history item", res.status);
}

export async function clearHistory(): Promise<void> {
  const res = await authed(`${BASE}/history`, { method: "DELETE" });
  if (!res.ok) throw new ApiError("Failed to clear history", res.status);
}

export function fetchSubscriptions(): Promise<SubscriptionItem[]> {
  return authedJson(`${BASE}/subscriptions`);
}

export async function subscribe(item: Omit<SubscriptionItem, "subscribedAt">): Promise<void> {
  const normalizedItem = {
    ...item,
    channelUrl: normalizeChannelUrl(item.channelUrl),
  };
  const res = await authed(`${BASE}/subscriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(normalizedItem),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "subscribe failed" }));
    throw new ApiError((body as { error: string }).error, res.status);
  }
}

export async function unsubscribe(channelUrl: string): Promise<void> {
  const variants = channelUrlVariants(channelUrl);
  const responses = await Promise.all(
    variants.map((variant) =>
      authed(`${BASE}/subscriptions/${encodeURIComponent(variant)}`, {
        method: "DELETE",
      }),
    ),
  );
  for (const res of responses) {
    if (res.ok || res.status === 404) continue;
    const body = await res.json().catch(() => ({ error: "unsubscribe failed" }));
    throw new ApiError((body as { error: string }).error, res.status);
  }
}

export function fetchSettings(): Promise<SettingsItem> {
  return authedJson(`${BASE}/settings`);
}

export function updateSettings(settings: SettingsItem): Promise<SettingsItem> {
  return authedJson(`${BASE}/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
}

export async function fetchSearchHistoryPage(
  page: number,
  limit: number,
): Promise<SearchHistoryPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  const res = await authed(`${BASE}/search-history?${params}`);
  const body = normalizeApiPayload(await res.json().catch(() => []));
  if (!res.ok) throw new ApiError((body as { error: string }).error, res.status);
  const items = Array.isArray(body) ? (body as SearchHistoryItem[]) : [];
  const totalHeader = Number(res.headers.get("X-Total-Count"));
  const total = Number.isFinite(totalHeader) ? totalHeader : items.length;
  return { items, total, page, limit };
}

export async function addSearchHistory(term: string): Promise<SearchHistoryItem> {
  return authedJson(`${BASE}/search-history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ term }),
  });
}

export async function clearSearchHistory(): Promise<void> {
  await authed(`${BASE}/search-history`, { method: "DELETE" });
}

export async function fetchSubscriptionFeed(page: number): Promise<SubscriptionFeedPage> {
  const search = new URLSearchParams({ page: String(page), limit: "30" });
  return authedJson(`${BASE}/subscriptions/feed?${search.toString()}`);
}

export async function fetchSubscriptionShorts(
  page: number,
  limit = 30,
  service?: number,
  blended = true,
): Promise<SubscriptionFeedPage> {
  const search = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    blended: String(blended),
  });
  if (service !== undefined) search.set("service", String(service));
  return authedJson(`${BASE}/subscriptions/shorts?${search.toString()}`);
}
