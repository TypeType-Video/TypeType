import type {
  CommentsPageResponse,
  PodcastEpisodesResponse,
  PodcastPageResponse,
} from "../types/api";
import { recordApiError } from "./api-error-log";
import { extractRequestId, recordClientEvent } from "./client-debug-log";
import { sanitizeDebugText, sanitizeRequestPath } from "./debug-sanitize";
import { API_BASE as BASE } from "./env";
import { optionalBearer } from "./optional-bearer";
import { normalizeApiPayload } from "./text-normalize";

export class ApiError extends Error {
  status: number;
  code: string | null;
  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type ErrorLikeBody = {
  code?: string;
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

function toErrorCode(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const candidate = body as ErrorLikeBody;
  return typeof candidate.code === "string" && candidate.code.length > 0 ? candidate.code : null;
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
    const errorCode = toErrorCode(body);
    recordApiError({
      endpoint: url,
      status: res.status,
      code: errorCode ?? "HTTP_ERROR",
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
    throw new ApiError(errorMessage, res.status, errorCode);
  }
  return body as T;
}

export function fetchComments(url: string, nextpage?: string): Promise<CommentsPageResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return request(`${BASE}/comments?${params}`, optionalBearer());
}

export function fetchCommentReplies(
  url: string,
  repliesPage: string,
): Promise<CommentsPageResponse> {
  const params = new URLSearchParams({ url, repliesPage });
  return request(`${BASE}/comments/replies?${params}`, optionalBearer());
}

export function fetchPodcasts(url: string, nextpage?: string): Promise<PodcastPageResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return request(`${BASE}/podcasts?${params}`, optionalBearer());
}

export function fetchPodcastEpisodes(
  url: string,
  nextpage?: string,
): Promise<PodcastEpisodesResponse> {
  const params = new URLSearchParams({ url });
  if (nextpage) params.set("nextpage", nextpage);
  return request(`${BASE}/podcasts/episodes?${params}`, optionalBearer());
}
