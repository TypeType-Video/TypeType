import type { AudioStreamItem, VideoStreamItem } from "../types/api";
import type { SabrSourceConfig } from "../types/sabr";
import type { VideoStream } from "../types/stream";
import { request } from "./api";
import { toApiUrl } from "./env";
import { optionalBearer } from "./optional-bearer";
import { SABR_VIDEO_TYPE } from "./sabr-video-loader";
import type { MediaSrc } from "./vidstack";

const PREFIX = "/player-sabr-ws/";

type SabrCandidate = VideoStreamItem | AudioStreamItem;
type SabrSessionDescriptor = {
  protocol?: string;
  transport?: string;
  endpoints?: {
    dash?: string;
    hls?: string;
  };
};

function isSabrCandidate(item: SabrCandidate): boolean {
  return item.deliveryMethod === "sabr" && Boolean(item.sabrSessionUrl?.trim());
}

function mediaSrcValue(src: MediaSrc): string {
  if (typeof src === "string") return src;
  if (!("src" in src)) return "";
  return typeof src.src === "string" ? src.src : "";
}

function playableVideos(stream: VideoStream): VideoStreamItem[] {
  const videos = [...(stream.videoOnlyStreams ?? []), ...(stream.videoStreams ?? [])];
  return videos.filter(isSabrCandidate);
}

function pickAudio(stream: VideoStream): AudioStreamItem | null {
  const audios = stream.audioStreams ?? [];
  return audios.find((item) => isSabrCandidate(item) && item.codec === "mp4a.40.2") ?? null;
}

function manifestUrl(sessionUrl: string, audio: AudioStreamItem | null): string | null {
  try {
    const url = new URL(sessionUrl, "https://typetype.invalid");
    url.pathname = url.pathname.replace("/sabr/session/", "/sabr/manifest/");
    url.searchParams.set("format", "hls");
    if (audio) url.searchParams.set("audioItag", String(audio.itag));
    url.searchParams.delete("playerTimeMs");
    return toApiUrl(`${url.pathname}${url.search}`);
  } catch {
    return null;
  }
}

function descriptorSrc(descriptor: SabrSessionDescriptor): MediaSrc | null {
  if (descriptor.transport !== "http-segments") return null;
  if (descriptor.protocol !== "typetype-sabr-http-v1") return null;
  const firefox = typeof navigator !== "undefined" && navigator.userAgent.includes("Firefox/");
  const endpoint = firefox ? descriptor.endpoints?.dash : descriptor.endpoints?.hls;
  if (endpoint) {
    return {
      src: toApiUrl(endpoint),
      type: firefox ? "application/dash+xml" : "application/x-mpegurl",
    };
  }
  if (!descriptor.endpoints?.dash) return null;
  return { src: toApiUrl(descriptor.endpoints.dash), type: "application/dash+xml" };
}

export function resolveSabrSessionSrc(stream: VideoStream): MediaSrc | null {
  const video = playableVideos(stream)[0] ?? null;
  if (!video?.sabrSessionUrl) return null;
  const src = manifestUrl(video.sabrSessionUrl, pickAudio(stream));
  return src ? { src, type: "application/x-mpegurl" } : null;
}

export async function resolveSabrHttpSessionSrc(stream: VideoStream): Promise<MediaSrc | null> {
  const video = playableVideos(stream)[0] ?? null;
  if (!video?.sabrSessionUrl) return null;
  const descriptor = await request<SabrSessionDescriptor>(
    toApiUrl(video.sabrSessionUrl),
    optionalBearer(),
  );
  return descriptorSrc(descriptor);
}

export function isSabrSessionSource(src: MediaSrc): boolean {
  if (typeof src !== "string" && "type" in src && src.type !== SABR_VIDEO_TYPE) return false;
  return mediaSrcValue(src).startsWith(PREFIX);
}

export function sabrSessionConfig(_src: MediaSrc): SabrSourceConfig | null {
  return null;
}

export function hasSabrSession(stream: VideoStream): boolean {
  return playableVideos(stream).length > 0;
}
