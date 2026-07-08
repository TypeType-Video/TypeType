import type { HttpClient } from "./http-client";
import {
  type PlaybackWindow,
  type PlaybackWindowRequest,
  parsePlaybackWindow,
} from "./playback-window";

export type PlaybackResponse = {
  sessionId: string;
  videoId: string;
  generation: number | null;
  ready: boolean;
  retryAfterMs: number | null;
};

export type CreatePlaybackRequest = {
  videoId: string;
  videoItag: number;
  audioItag: number;
  audioTrackId: string | null;
  startTimeMs: number;
};

export type SeekPlaybackOptions = {
  videoItag?: number;
  audioItag?: number;
  audioTrackId?: string | null;
};

function field(value: object, key: string): unknown {
  return Reflect.get(value, key);
}

function stringField(value: object, key: string): string | null {
  const result = field(value, key);
  return typeof result === "string" && result.length > 0 ? result : null;
}

function numberField(value: object, key: string): number | null {
  const result = field(value, key);
  return typeof result === "number" && Number.isFinite(result) ? result : null;
}

function parsePlaybackResponse(value: unknown): PlaybackResponse {
  if (!value || typeof value !== "object") throw new Error("Invalid playback response");
  const sessionId = stringField(value, "sessionId");
  const videoId = stringField(value, "videoId");
  if (!sessionId || !videoId) throw new Error("Invalid playback response");
  return {
    sessionId,
    videoId,
    generation: numberField(value, "generation"),
    ready: field(value, "ready") === true,
    retryAfterMs: numberField(value, "retryAfterMs"),
  };
}

export class PlaybackClient {
  constructor(private readonly http: HttpClient) {}

  async create(request: CreatePlaybackRequest, signal?: AbortSignal): Promise<PlaybackResponse> {
    const params = new URLSearchParams({
      videoItag: String(request.videoItag),
      audioItag: String(request.audioItag),
      startTimeMs: String(request.startTimeMs),
    });
    if (request.audioTrackId) params.set("audioTrackId", request.audioTrackId);
    const videoId = encodeURIComponent(request.videoId);
    const init = signal ? { method: "POST", signal } : { method: "POST" };
    const response = await this.http.json(`/sabr/playback/${videoId}?${params}`, init);
    return parsePlaybackResponse(response);
  }

  async seek(
    sessionId: string,
    positionMs: number,
    options: SeekPlaybackOptions = {},
    signal?: AbortSignal,
  ): Promise<PlaybackResponse> {
    const session = encodeURIComponent(sessionId);
    const params = new URLSearchParams({
      playerTimeMs: String(Math.max(0, Math.round(positionMs))),
    });
    if (options.videoItag) params.set("videoItag", String(options.videoItag));
    if (options.audioItag) params.set("audioItag", String(options.audioItag));
    if (options.audioTrackId) params.set("audioTrackId", options.audioTrackId);
    const init = signal ? { method: "POST", signal } : { method: "POST" };
    const response = await this.http.json(`/sabr/playback/${session}/seek?${params}`, init);
    return parsePlaybackResponse(response);
  }

  async window(
    sessionId: string,
    request: PlaybackWindowRequest,
    signal?: AbortSignal,
  ): Promise<PlaybackWindow> {
    const session = encodeURIComponent(sessionId);
    const path = `/sabr/playback/${session}/window`;
    const init: RequestInit = {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(request),
    };
    const response = await this.http.json(path, signal ? { ...init, signal } : init);
    return parsePlaybackWindow(response, this.http.absolute(path));
  }
}
