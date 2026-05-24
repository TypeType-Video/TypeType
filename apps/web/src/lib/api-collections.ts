import type { BlockedItem, FavoriteItem, ProgressItem, WatchLaterItem } from "../types/user";
import { ApiError } from "./api";
import { authed, authedJson } from "./authed";

import { API_BASE as BASE } from "./env";

async function throwIfFailed(res: Response, fallback: string): Promise<void> {
  if (res.ok) return;
  const body = await res.json().catch(() => ({ error: fallback }));
  throw new ApiError((body as { error: string }).error, res.status);
}

export async function fetchProgress(videoUrl: string): Promise<ProgressItem> {
  const res = await authed(`${BASE}/progress/${encodeURIComponent(videoUrl)}`, undefined, {
    silentStatuses: [404],
  });
  if (res.status === 404) return { videoUrl, position: 0, updatedAt: 0 };
  const body = await res.json();
  if (!res.ok) throw new ApiError((body as { error: string }).error, res.status);
  return body as ProgressItem;
}

export async function updateProgress(videoUrl: string, position: number): Promise<void> {
  const res = await authed(`${BASE}/progress/${encodeURIComponent(videoUrl)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ position: Math.round(position) }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "update failed" }));
    throw new ApiError((body as { error: string }).error, res.status);
  }
}

export function fetchBlockedChannels(): Promise<BlockedItem[]> {
  return authedJson(`${BASE}/blocked/channels`);
}

export async function blockChannel(
  url: string,
  name?: string,
  thumbnailUrl?: string,
  global = false,
): Promise<void> {
  await authed(`${BASE}/blocked/channels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, name, thumbnailUrl, global }),
  });
}

export async function unblockChannel(url: string): Promise<void> {
  const res = await authed(`${BASE}/blocked/channels/${encodeURIComponent(url)}`, {
    method: "DELETE",
  });
  await throwIfFailed(res, "unblock failed");
}

export function fetchBlockedVideos(): Promise<BlockedItem[]> {
  return authedJson(`${BASE}/blocked/videos`);
}

export async function blockVideo(url: string, global = false): Promise<void> {
  await authed(`${BASE}/blocked/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, global }),
  });
}

export async function unblockVideo(url: string): Promise<void> {
  const res = await authed(`${BASE}/blocked/videos/${encodeURIComponent(url)}`, {
    method: "DELETE",
  });
  await throwIfFailed(res, "unblock failed");
}

export function fetchFavorites(): Promise<FavoriteItem[]> {
  return authedJson(`${BASE}/favorites`);
}

export function addFavorite(videoUrl: string): Promise<FavoriteItem> {
  return authedJson(`${BASE}/favorites/${encodeURIComponent(videoUrl)}`, { method: "POST" });
}

export async function removeFavorite(videoUrl: string): Promise<void> {
  const res = await authed(`${BASE}/favorites/${encodeURIComponent(videoUrl)}`, {
    method: "DELETE",
  });
  await throwIfFailed(res, "remove failed");
}

export function fetchWatchLater(): Promise<WatchLaterItem[]> {
  return authedJson(`${BASE}/watch-later`);
}

export function addWatchLater(item: Omit<WatchLaterItem, "addedAt">): Promise<WatchLaterItem> {
  return authedJson(`${BASE}/watch-later`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
}

export async function removeWatchLater(videoUrl: string): Promise<void> {
  const res = await authed(`${BASE}/watch-later/${encodeURIComponent(videoUrl)}`, {
    method: "DELETE",
  });
  await throwIfFailed(res, "remove failed");
}
