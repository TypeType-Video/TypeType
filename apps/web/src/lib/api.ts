import type {
  BulletCommentsPageResponse,
  ChannelResponse,
  CommentsPageResponse,
  PodcastEpisodesResponse,
  PodcastPageResponse,
  SearchPageResponse,
  StreamResponse,
} from "../types/api";
import type { PublicPlaylistResponse } from "../types/playlist";
import { recordApiError } from "./api-error-log";
import { extractRequestId, recordClientEvent } from "./client-debug-log";
import { sanitizeDebugText, sanitizeRequestPath } from "./debug-sanitize";
import { API_BASE as BASE } from "./env";
import { normalizeApiPayload } from "./text-normalize";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type ChannelSort = "latest" | "popular" | "oldest";

type ErrorLikeBody = {
  error?: string;
  message?: string;
};

async function readBody(res: Response): Promise<unknown> {
  const contentType = res.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    return res
      .json()
      .then(normalizeApiPayload)
      .catch(() => null);
  }
  return res
    .text()
    .then(normalizeApiPayload)
    .catch(() => "");
}

function toErrorMessage(status: number, statusText: string, body: unknown): string {
  if (typeof body === "string") {
    const trimmed = body.trim();
    if (trimmed.length > 0) return trimmed;
  }
  if (body && typeof body === "object") {
    const candidate = body as ErrorLikeBody;
    if (typeof candidate.error === "string" && candidate.error.length > 0) return candidate.error;
    if (typeof candidate.message === "string" && candidate.message.length > 0)
      return candidate.message;
  }
  if (status === 429) return "Too many requests. Try again in a few seconds.";
  if (statusText.length > 0) return statusText;
  return "Request failed";
}

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const method = init?.method ?? "GET";
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (error) {
    const message = error instanceof Error ? error.message : "network_error";
    recordApiError({
      endpoint: url,
      status: 520,
      code: "NETWORK_ERROR",
      message,
    });
    recordClientEvent("api.network_error", {
      method,
      path: sanitizeRequestPath(url),
      message: sanitizeDebugText(message),
    });
    throw error;
  }
  const body = await readBody(res);
  if (!res.ok) {
    const requestId = extractRequestId(res.headers);
    const errorMessage = toErrorMessage(res.status, res.statusText, body);
    recordApiError({
      endpoint: url,
      status: res.status,
      code: "HTTP_ERROR",
      message: errorMessage,
      requestId,
    });
    recordClientEvent("api.response_error", {
      method,
      path: sanitizeRequestPath(url),
      status: res.status,
      requestId,
      message: sanitizeDebugText(errorMessage),
    });
    throw new ApiError(errorMessage, res.status);
  }
  return body as T;
}

export function fetchStream(url: string): Promise<StreamResponse> {
  return request(`${BASE}/streams?url=${encodeURIComponent(url)}`);
}

export function fetchSearch(
  q: string,
  service: number,
  nextpage?: string,
): Promise<SearchPageResponse> {
  const params = new URLSearchParams({ q, service: String(service) });
  if (nextpage) params.set("nextpage", nextpage);
  return request(`${BASE}/search?${params}`);
}

export function fetchComments(url: string, nextpage?: string): Promise<CommentsPageResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return request(`${BASE}/comments?${params}`);
}

export function fetchCommentReplies(
  url: string,
  repliesPage: string,
): Promise<CommentsPageResponse> {
  const params = new URLSearchParams({ url, repliesPage });
  return request(`${BASE}/comments/replies?${params}`);
}

export function fetchChannel(
  url: string,
  nextpage?: string,
  sort?: ChannelSort,
): Promise<ChannelResponse> {
  return request(`${BASE}/channel/page`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, nextpage: nextpage ?? null, sort: sort ?? null }),
  });
}

export function fetchPodcasts(url: string, nextpage?: string): Promise<PodcastPageResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return request(`${BASE}/podcasts?${params}`);
}

export function fetchPodcastEpisodes(
  url: string,
  nextpage?: string,
): Promise<PodcastEpisodesResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return request(`${BASE}/podcasts/episodes?${params}`);
}

export function fetchSuggestions(query: string, service: number): Promise<string[]> {
  const params = new URLSearchParams({ query, service: String(service) });
  return request(`${BASE}/suggestions?${params}`);
}

export function fetchBulletComments(url: string): Promise<BulletCommentsPageResponse> {
  return request(`${BASE}/bullet-comments?url=${encodeURIComponent(url)}`);
}

export function fetchPublicPlaylist(
  url: string,
  nextpage?: string,
): Promise<PublicPlaylistResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return request(`${BASE}/playlist?${params}`);
}
