import { useAuthStore } from "../stores/auth-store";
import { ApiError, request } from "./api";
import { API_BASE as BASE, toApiUrl } from "./env";
import type { MediaSrc } from "./vidstack";

export type AudioOnlyResponse = {
  kind?: "progressive" | "hls" | "dash";
  src: string;
  mimeType: string;
  codec: string | null;
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

export function toAudioOnlyMediaSrc(response: AudioOnlyResponse): MediaSrc | null {
  if (response.kind !== undefined && response.kind !== "progressive") {
    return null;
  }
  if (response.mimeType.includes("mpegurl") || response.mimeType.includes("x-mpegurl")) {
    return null;
  }
  if (response.mimeType.includes("dash+xml")) {
    return null;
  }
  if (response.mimeType.includes("webm")) {
    return { src: toApiUrl(response.src), type: "audio/webm" };
  }
  if (response.mimeType.includes("audio/mp4")) {
    return toApiUrl(response.src);
  }
  return null;
}

export function isAudioOnlyUnavailable(error: unknown): boolean {
  return error instanceof ApiError && error.status === 422;
}
