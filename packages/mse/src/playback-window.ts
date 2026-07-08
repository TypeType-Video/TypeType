import type { ManifestSegment, ManifestTrack, PlaybackManifest } from "./manifest";
import type { TrackKind } from "./types";

export type PlaybackWindowRequest = {
  generation: number | null;
  playerTimeMs: number;
  videoItag: number;
  audioItag: number;
  audioTrackId: string | null;
  bufferGoalMs: number;
  backBufferMs: number;
};

export type PlaybackWindow = {
  sessionId: string;
  generation: number | null;
  ready: boolean;
  retryAfterMs: number | null;
  terminalError: string | null;
  manifest: PlaybackManifest | null;
};

function field(value: object, key: string): unknown {
  return Reflect.get(value, key);
}

function objectField(value: object, key: string): object | null {
  const result = field(value, key);
  return result && typeof result === "object" ? result : null;
}

function stringField(value: object, key: string): string | null {
  const result = field(value, key);
  return typeof result === "string" && result.length > 0 ? result : null;
}

function numberField(value: object, key: string): number | null {
  const result = field(value, key);
  return typeof result === "number" && Number.isFinite(result) ? result : null;
}

function arrayField(value: object, key: string): unknown[] {
  const result = field(value, key);
  return Array.isArray(result) ? result : [];
}

function resolveUrl(baseUrl: string, url: string): string {
  return new URL(url, baseUrl).href;
}

function parseSegment(value: unknown, baseUrl: string): ManifestSegment | null {
  if (!value || typeof value !== "object") return null;
  const url = stringField(value, "url");
  const startMs = numberField(value, "startMs");
  const durationMs = numberField(value, "durationMs");
  if (!url || startMs === null || durationMs === null) return null;
  return { url: resolveUrl(baseUrl, url), startMs, durationMs };
}

function parseTrack(kind: TrackKind, value: object, baseUrl: string): ManifestTrack | null {
  const mime = stringField(value, "mime");
  const initUrl = stringField(value, "initUrl");
  if (!mime || !initUrl) return null;
  const segments = arrayField(value, "segments").flatMap((segment) => {
    const parsed = parseSegment(segment, baseUrl);
    return parsed ? [parsed] : [];
  });
  return { kind, mime, initUrl: resolveUrl(baseUrl, initUrl), segments };
}

function parseManifest(value: object, baseUrl: string): PlaybackManifest | null {
  const durationMs = numberField(value, "durationMs") ?? 0;
  const audioValue = objectField(value, "audio");
  const videoValue = objectField(value, "video");
  if (!audioValue || !videoValue) return null;
  const audio = parseTrack("audio", audioValue, baseUrl);
  const video = parseTrack("video", videoValue, baseUrl);
  return audio && video ? { durationMs, audio, video } : null;
}

export function parsePlaybackWindow(value: unknown, baseUrl: string): PlaybackWindow {
  if (!value || typeof value !== "object") throw new Error("Invalid playback window");
  const sessionId = stringField(value, "sessionId");
  if (!sessionId) throw new Error("Invalid playback window");
  const manifestValue = objectField(value, "manifest") ?? value;
  return {
    sessionId,
    generation: numberField(value, "generation"),
    ready: field(value, "ready") === true,
    retryAfterMs: numberField(value, "retryAfterMs"),
    terminalError: stringField(value, "terminalError"),
    manifest: parseManifest(manifestValue, baseUrl),
  };
}
