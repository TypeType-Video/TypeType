import type { AdminSession } from "../types/admin";
import { ApiError } from "./api";
import { authed, authedJson } from "./authed";
import { API_BASE as BASE } from "./env";

export type SessionDevicePayload = {
  clientName?: string;
  clientVersion?: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
};

export type SessionPlaybackPayload = SessionDevicePayload & {
  videoUrl?: string;
  title?: string;
  thumbnail?: string | null;
  channelName?: string | null;
  positionMs?: number;
  durationMs?: number | null;
  paused?: boolean;
};

export type SessionPlaybackStartPayload = SessionDevicePayload & {
  videoUrl: string;
  title: string;
  thumbnail?: string | null;
  channelName?: string | null;
  positionMs?: number;
  durationMs?: number | null;
  paused?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object";
}

function isNullableString(value: unknown): value is string | null | undefined {
  return value === null || value === undefined || typeof value === "string";
}

function isNullableNumber(value: unknown): value is number | null | undefined {
  return value === null || value === undefined || typeof value === "number";
}

function isNowPlaying(value: unknown): value is NonNullable<AdminSession["nowPlaying"]> {
  if (!isRecord(value)) return false;
  return (
    typeof value.videoUrl === "string" &&
    typeof value.title === "string" &&
    isNullableString(value.thumbnail) &&
    isNullableString(value.channelName) &&
    typeof value.positionMs === "number" &&
    isNullableNumber(value.durationMs) &&
    typeof value.paused === "boolean" &&
    typeof value.updatedAt === "number"
  );
}

function isAdminSession(value: unknown): value is AdminSession {
  if (!isRecord(value)) return false;
  const nowPlaying = value.nowPlaying;
  return (
    typeof value.id === "string" &&
    isNullableString(value.userId) &&
    isNullableString(value.username) &&
    isNullableString(value.clientName) &&
    isNullableString(value.clientVersion) &&
    isNullableString(value.deviceId) &&
    isNullableString(value.deviceName) &&
    isNullableString(value.deviceType) &&
    isNullableString(value.userAgent) &&
    isNullableString(value.remoteAddress) &&
    typeof value.lastActivityAt === "number" &&
    isNullableNumber(value.lastPlaybackAt) &&
    (nowPlaying === null || nowPlaying === undefined || isNowPlaying(nowPlaying))
  );
}

export async function fetchAdminSessions(): Promise<AdminSession[]> {
  const payload = await authedJson<unknown>(`${BASE}/admin/sessions`);
  if (!Array.isArray(payload) || !payload.every(isAdminSession)) {
    throw new ApiError("Invalid admin sessions payload", 500);
  }
  return payload;
}

async function postSession(path: string, body: SessionDevicePayload | SessionPlaybackPayload) {
  const res = await authed(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (res.status !== 204) throw new ApiError("Session reporting failed", res.status);
}

export function reportSessionActivity(body: SessionDevicePayload): Promise<void> {
  return postSession("/sessions/activity", body);
}

export function reportPlaybackStart(body: SessionPlaybackStartPayload): Promise<void> {
  return postSession("/sessions/playback/start", body);
}

export function reportPlaybackProgress(body: SessionPlaybackPayload): Promise<void> {
  return postSession("/sessions/playback/progress", body);
}

export function reportPlaybackStop(body: SessionDevicePayload): Promise<void> {
  return postSession("/sessions/playback/stop", body);
}
