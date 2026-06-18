import { ApiError } from "./api";
import { authed, authedJson } from "./authed";
import { API_BASE as BASE } from "./env";

export type YoutubeSessionStatus = "disconnected" | "connected" | "needs_reconnect";

export type YoutubeSessionState = {
  status: YoutubeSessionStatus;
  updatedAt: number;
  lastUsedAt: number;
};

export type YoutubeRemoteBrowserSession = {
  sessionId: string;
  wsUrl: string;
  expiresAt: number;
};

export function isYoutubeSessionReconnectError(error: unknown): boolean {
  return error instanceof ApiError && error.code === "youtube_session_needs_reconnect";
}

export function fetchYoutubeSessionStatus(): Promise<YoutubeSessionState> {
  return authedJson(`${BASE}/youtube-session/status`);
}

export function startYoutubeSessionBrowser(
  returnTo?: string,
): Promise<YoutubeRemoteBrowserSession> {
  return authedJson(`${BASE}/youtube-session/browser/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returnTo: returnTo ?? null }),
  });
}

export async function cancelYoutubeSessionBrowser(sessionId: string): Promise<void> {
  const res = await authed(`${BASE}/youtube-session/browser/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new ApiError("Failed to close YouTube login", res.status);
}

export async function disconnectYoutubeSession(): Promise<void> {
  const res = await authed(`${BASE}/youtube-session`, { method: "DELETE" });
  if (!res.ok) throw new ApiError("Failed to disconnect YouTube session", res.status);
}
