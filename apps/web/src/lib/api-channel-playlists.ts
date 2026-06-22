import type { ChannelPlaylistsResponse } from "../types/playlist";
import { request } from "./api";
import { API_BASE as BASE } from "./env";
import { optionalBearer } from "./optional-bearer";

export function fetchChannelPlaylists(
  url: string,
  nextpage?: string,
): Promise<ChannelPlaylistsResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return request(`${BASE}/channel/playlists?${params}`, optionalBearer());
}
