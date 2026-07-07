import { ApiError, request } from "./api";
import { API_BASE as BASE, toAbsoluteApiUrl } from "./env";
import { optionalBearer } from "./optional-bearer";
import type { MediaSrc } from "./vidstack";

type SabrPlaybackStatus = "ready" | "preparing";

export type SabrPlaybackSource = {
  sessionId: string;
  src: MediaSrc;
};

type SabrPlaybackResponse = {
  sessionId: string;
  videoId: string;
  manifestUrl: string | null;
  generation: number | null;
  videoItag: number;
  audioItag: number;
  audioTrackId: string | null;
  startTimeMs: number;
  ready: boolean;
  status: SabrPlaybackStatus;
  retryAfterMs: number | null;
};

type PlaybackRequest = {
  videoId: string;
  videoItag: number;
  audioItag: number;
  audioTrackId: string | null;
  startTimeMs: number;
};

const MAX_READY_POLLS = 12;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function numberField(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringField(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function parsePlaybackResponse(value: unknown): SabrPlaybackResponse {
  if (!value || typeof value !== "object") {
    throw new ApiError("Invalid SABR playback response", 500);
  }
  const body = value as Record<string, unknown>;
  const sessionId = stringField(body.sessionId);
  const videoId = stringField(body.videoId);
  const videoItag = numberField(body.videoItag);
  const audioItag = numberField(body.audioItag);
  const startTimeMs = numberField(body.startTimeMs);
  const status = body.status === "ready" || body.status === "preparing" ? body.status : null;
  if (!sessionId || !videoId || videoItag === null || audioItag === null || startTimeMs === null) {
    throw new ApiError("Invalid SABR playback response", 500);
  }
  return {
    sessionId,
    videoId,
    manifestUrl: typeof body.manifestUrl === "string" ? body.manifestUrl : null,
    generation: numberField(body.generation),
    videoItag,
    audioItag,
    audioTrackId: typeof body.audioTrackId === "string" ? body.audioTrackId : null,
    startTimeMs,
    ready: body.ready === true,
    status: status ?? "preparing",
    retryAfterMs: numberField(body.retryAfterMs),
  };
}

function toSource(response: SabrPlaybackResponse): SabrPlaybackSource {
  if (!response.ready) {
    throw new ApiError("SABR playback is not ready", 202, response.status);
  }
  return {
    sessionId: response.sessionId,
    src: {
      src: manifestSrc(response),
      type: "application/dash+xml",
    },
  };
}

function manifestPath(response: SabrPlaybackResponse): string {
  return (
    response.manifestUrl ?? `/sabr/playback/${encodeURIComponent(response.sessionId)}/manifest`
  );
}

function manifestSrc(response: SabrPlaybackResponse): string {
  const url = new URL(toAbsoluteApiUrl(manifestPath(response)));
  if (response.generation !== null) url.searchParams.set("generation", String(response.generation));
  return url.href;
}

async function readRetryAfter(response: Response): Promise<number> {
  const body = await response.json().catch(() => null);
  if (!body || typeof body !== "object" || !("retryAfterMs" in body)) return 750;
  const retryAfterMs = body.retryAfterMs;
  return typeof retryAfterMs === "number" && Number.isFinite(retryAfterMs) ? retryAfterMs : 750;
}

async function waitForManifest(response: SabrPlaybackResponse): Promise<SabrPlaybackSource> {
  const src = manifestSrc(response);
  for (let attempt = 0; attempt < MAX_READY_POLLS; attempt++) {
    const manifest = await fetch(src, optionalBearer({ cache: "no-store" }));
    if (manifest.ok)
      return { sessionId: response.sessionId, src: { src, type: "application/dash+xml" } };
    if (manifest.status !== 202) {
      throw new ApiError(manifest.statusText || "SABR playback manifest failed", manifest.status);
    }
    await sleep(await readRetryAfter(manifest));
  }
  throw new ApiError("SABR playback is not ready", 202, response.status);
}

async function waitForReady(endpoint: string): Promise<SabrPlaybackSource> {
  const response = parsePlaybackResponse(
    await request<unknown>(endpoint, optionalBearer({ method: "POST", cache: "no-store" })),
  );
  return response.ready ? toSource(response) : waitForManifest(response);
}

export function createSabrPlayback(request: PlaybackRequest): Promise<SabrPlaybackSource> {
  const params = new URLSearchParams({
    videoItag: String(request.videoItag),
    audioItag: String(request.audioItag),
    startTimeMs: String(request.startTimeMs),
  });
  if (request.audioTrackId) params.set("audioTrackId", request.audioTrackId);
  const videoId = encodeURIComponent(request.videoId);
  return waitForReady(`${BASE}/sabr/playback/${videoId}?${params}`);
}

export function seekSabrPlayback(
  sessionId: string,
  playerTimeMs: number,
): Promise<SabrPlaybackSource> {
  const params = new URLSearchParams({ playerTimeMs: String(playerTimeMs) });
  const encodedSession = encodeURIComponent(sessionId);
  return waitForReady(`${BASE}/sabr/playback/${encodedSession}/seek?${params}`);
}
