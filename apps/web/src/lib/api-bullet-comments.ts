import type { BulletCommentsPageResponse } from "../types/api";
import { request } from "./api";
import { API_BASE as BASE } from "./env";

export function fetchBulletComments(url: string): Promise<BulletCommentsPageResponse> {
  return request(`${BASE}/bullet-comments?url=${encodeURIComponent(url)}`);
}
