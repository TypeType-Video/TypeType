import type {
  AdminAllowListUser,
  AdminUserAllowList,
  AllowedPlaylistItem,
  AllowPlaylistInput,
} from "../types/allow-list";
import type { AccessMode } from "../types/user";
import { ApiError } from "./api";
import { authed, authedJson } from "./authed";
import { API_BASE as BASE } from "./env";

export function searchAdminUsers(q: string, limit = 20): Promise<AdminAllowListUser[]> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  return authedJson(`${BASE}/admin/users/search?${params}`);
}

export function fetchAdminUserAllowList(id: string): Promise<AdminUserAllowList> {
  return authedJson(`${BASE}/admin/users/${encodeURIComponent(id)}/allow-list`);
}

export async function updateAdminUserAccessMode(
  id: string,
  accessMode: AccessMode,
): Promise<AccessMode> {
  const res = await authed(`${BASE}/admin/users/${encodeURIComponent(id)}/access-mode`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessMode }),
  });
  const body = (await res.json().catch(() => ({ accessMode }))) as Partial<{
    accessMode: AccessMode;
  }>;
  if (!res.ok) throw new ApiError("Failed to update access mode", res.status);
  return body.accessMode === "allow_list" ? "allow_list" : "unrestricted";
}

export function addAdminUserAllowedChannel(
  id: string,
  url: string,
  name?: string | null,
  thumbnailUrl?: string | null,
) {
  return authedJson(`${BASE}/admin/users/${encodeURIComponent(id)}/allowed/channels`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, name, thumbnailUrl }),
  });
}

export async function removeAdminUserAllowedChannel(id: string, channelUrl: string): Promise<void> {
  const res = await authed(
    `${BASE}/admin/users/${encodeURIComponent(id)}/allowed/channels/${encodeURIComponent(channelUrl)}`,
    { method: "DELETE" },
  );
  if (!res.ok && res.status !== 404) throw new ApiError("Failed to remove channel", res.status);
}

export function fetchAdminAllowedPlaylists(): Promise<AllowedPlaylistItem[]> {
  return authedJson(`${BASE}/admin/allowed/playlists`);
}

export function addAdminAllowedPlaylist(input: AllowPlaylistInput): Promise<AllowedPlaylistItem> {
  return authedJson(`${BASE}/admin/allowed/playlists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function removeAdminAllowedPlaylist(url: string): Promise<void> {
  const res = await authed(`${BASE}/admin/allowed/playlists/${encodeURIComponent(url)}`, {
    method: "DELETE",
  });
  if (!res.ok && res.status !== 404) throw new ApiError("Failed to remove playlist", res.status);
}

export function addAdminUserAllowedPlaylist(id: string, input: AllowPlaylistInput) {
  return authedJson(`${BASE}/admin/users/${encodeURIComponent(id)}/allowed/playlists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function removeAdminUserAllowedPlaylist(id: string, url: string): Promise<void> {
  const res = await authed(
    `${BASE}/admin/users/${encodeURIComponent(id)}/allowed/playlists/${encodeURIComponent(url)}`,
    { method: "DELETE" },
  );
  if (!res.ok && res.status !== 404) throw new ApiError("Failed to remove playlist", res.status);
}
