import type { PlaylistItem, PlaylistVideoItem } from "../types/user";
import { ApiError } from "./api";
import { authed, authedJson } from "./authed";
import { API_BASE as BASE } from "./env";

export function fetchPlaylists(): Promise<PlaylistItem[]> {
  return authedJson(`${BASE}/playlists`);
}

export function fetchPlaylist(id: string): Promise<PlaylistItem> {
  return authedJson(`${BASE}/playlists/${encodeURIComponent(id)}`);
}

export async function createPlaylist(name: string, description = ""): Promise<PlaylistItem> {
  return authedJson(`${BASE}/playlists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
}

export async function updatePlaylist(
  id: string,
  patch: { name?: string; description?: string },
): Promise<void> {
  await authed(`${BASE}/playlists/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export async function deletePlaylist(id: string): Promise<void> {
  await authed(`${BASE}/playlists/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export async function addVideoToPlaylist(
  playlistId: string,
  video: { url: string; title: string; thumbnail: string; duration: number },
): Promise<PlaylistVideoItem> {
  return authedJson(`${BASE}/playlists/${encodeURIComponent(playlistId)}/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(video),
  });
}

export async function removeVideoFromPlaylist(playlistId: string, videoUrl: string): Promise<void> {
  const res = await authed(
    `${BASE}/playlists/${encodeURIComponent(playlistId)}/videos/${encodeURIComponent(videoUrl)}`,
    { method: "DELETE" },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "remove failed" }));
    throw new ApiError((body as { error: string }).error, res.status);
  }
}
