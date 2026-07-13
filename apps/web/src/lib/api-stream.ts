import { useAuthStore } from "../stores/auth-store";
import type { StreamResponse } from "../types/api";
import { ApiError, request } from "./api";
import { recordClientEvent } from "./client-debug-log";
import { sanitizeVideoContext } from "./debug-sanitize";
import { type PlaybackMode, readPlaybackMode } from "./playback-mode";
import { streamEndpoint } from "./stream-request";

type StreamFetchMode = "anonymous_first" | "authenticated_first";

function streamInit(token: string | null, signal?: AbortSignal): RequestInit {
  if (!token) return { cache: "no-store", signal };
  return {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
    signal,
  };
}

export async function fetchStream(
  url: string,
  mode: StreamFetchMode = "anonymous_first",
  signal?: AbortSignal,
  playbackMode: PlaybackMode = readPlaybackMode(),
): Promise<StreamResponse> {
  const endpoint = streamEndpoint(url, playbackMode);
  const token = useAuthStore.getState().token;
  const video = sanitizeVideoContext(url) ?? "unknown";
  if (token && mode === "authenticated_first") {
    recordClientEvent("stream.fetch_start", { authed: true, video });
    return request<StreamResponse>(endpoint, streamInit(token, signal));
  }
  recordClientEvent("stream.fetch_start", { authed: false, video });
  try {
    const result = await request<StreamResponse>(endpoint, streamInit(null, signal));
    recordClientEvent("stream.fetch_success", { authed: false, video, hasHls: !!result.hlsUrl });
    return result;
  } catch (error) {
    if (!token || !(error instanceof ApiError)) {
      throw error;
    }
    recordClientEvent("stream.fetch_authenticated_fallback", { status: error.status, video });
    const result = await request<StreamResponse>(endpoint, streamInit(token, signal));
    recordClientEvent("stream.fetch_success", { authed: true, video, hasHls: !!result.hlsUrl });
    return result;
  }
}
