import { useAuthStore } from "../stores/auth-store";
import type { StreamResponse } from "../types/api";
import { ApiError, request } from "./api";
import { recordClientEvent } from "./client-debug-log";
import { sanitizeVideoContext } from "./debug-sanitize";
import { API_BASE as BASE } from "./env";

type StreamFetchMode = "anonymous_first" | "authenticated_first";

function streamInit(token: string | null): RequestInit {
  if (!token) return { cache: "no-store" };
  return {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  };
}

export async function fetchStream(
  url: string,
  mode: StreamFetchMode = "anonymous_first",
): Promise<StreamResponse> {
  const endpoint = `${BASE}/streams?url=${encodeURIComponent(url)}`;
  const token = useAuthStore.getState().token;
  const video = sanitizeVideoContext(url) ?? "unknown";
  if (token && mode === "authenticated_first") {
    recordClientEvent("stream.fetch_start", { authed: true, video });
    return request<StreamResponse>(endpoint, streamInit(token));
  }
  recordClientEvent("stream.fetch_start", { authed: false, video });
  try {
    const result = await request<StreamResponse>(endpoint, streamInit(null));
    recordClientEvent("stream.fetch_success", { authed: false, video, hasHls: !!result.hlsUrl });
    return result;
  } catch (error) {
    if (!token || !(error instanceof ApiError)) throw error;
    recordClientEvent("stream.fetch_authenticated_fallback", { status: error.status, video });
    const result = await request<StreamResponse>(endpoint, streamInit(token));
    recordClientEvent("stream.fetch_success", { authed: true, video, hasHls: !!result.hlsUrl });
    return result;
  }
}
