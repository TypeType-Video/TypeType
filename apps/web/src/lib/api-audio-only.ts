import { useAuthStore } from "../stores/auth-store";
import { ApiError, request } from "./api";
import { API_BASE as BASE, toApiUrl } from "./env";
import type { MediaSrc } from "./vidstack";

export type AudioOnlyResponse = {
  kind?: "progressive" | "hls";
  src: string;
  mimeType: string;
  codec: string;
  bitrate: number | null;
  contentLength: number | null;
  duration: number | null;
};

function audioOnlyInit(): RequestInit {
  const token = useAuthStore.getState().token;
  if (!token) return { cache: "no-store" };
  return {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  };
}

export function fetchAudioOnlyStream(
  url: string,
  preferOriginal: boolean,
  preferredLocale: string,
): Promise<AudioOnlyResponse> {
  const params = new URLSearchParams({
    url,
    preferOriginal: String(preferOriginal),
    preferredLocale,
  });
  return request<AudioOnlyResponse>(`${BASE}/streams/audio-only?${params}`, audioOnlyInit());
}

export function toAudioOnlyMediaSrc(response: AudioOnlyResponse): MediaSrc {
  if (
    response.kind === "hls" ||
    response.mimeType.includes("mpegurl") ||
    response.mimeType.includes("x-mpegurl")
  ) {
    return { src: toApiUrl(response.src), type: "application/x-mpegurl" };
  }
  if (response.mimeType.includes("webm")) {
    return { src: toApiUrl(response.src), type: "audio/webm" };
  }
  const mp4Source = {
    src: toApiUrl(response.src),
    type: "audio/mp4",
  };
  return mp4Source as MediaSrc;
}

export function isAudioOnlyUnavailable(error: unknown): boolean {
  return error instanceof ApiError && error.status === 422;
}
