import type { PublicPlaylistResponse } from "../types/playlist";
import { request } from "./api";
import { API_BASE as BASE } from "./env";
import { optionalBearer } from "./optional-bearer";

export function fetchPublicPlaylist(
  url: string,
  nextpage?: string,
): Promise<PublicPlaylistResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return request(`${BASE}/playlist?${params}`, optionalBearer());
}
