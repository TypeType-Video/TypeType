import type { AudioStreamItem, VideoStreamItem } from "../types/api";
import type { SabrQualityOption, SabrSourceConfig } from "../types/sabr";
import type { VideoStream } from "../types/stream";
import { toApiUrl } from "./env";
import { SABR_VIDEO_TYPE } from "./sabr-video-loader";
import type { MediaSrc } from "./vidstack";

const PREFIX = "/player-sabr-ws/";
const configs = new Map<string, SabrSourceConfig>();

type SabrCandidate = VideoStreamItem | AudioStreamItem;

function isSabrCandidate(item: SabrCandidate): boolean {
  return item.deliveryMethod === "sabr" && Boolean(item.sabrSessionUrl?.trim());
}

function stableId(value: string): string {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function mediaMime(item: VideoStreamItem | AudioStreamItem): string | null {
  if (!item.codec) return null;
  return `${item.mimeType}; codecs="${item.codec}"`;
}

function mediaSrcValue(src: MediaSrc): string {
  if (typeof src === "string") return src;
  if (!("src" in src)) return "";
  return typeof src.src === "string" ? src.src : "";
}

function canUseMse(video: VideoStreamItem): boolean {
  if (typeof MediaSource === "undefined") return false;
  const mime = mediaMime(video);
  return mime ? MediaSource.isTypeSupported(mime) : false;
}

function playableVideos(stream: VideoStream): VideoStreamItem[] {
  const videos = [...(stream.videoOnlyStreams ?? []), ...(stream.videoStreams ?? [])];
  return videos.filter((item) => isSabrCandidate(item) && canUseMse(item));
}

function qualityLabel(video: VideoStreamItem): string {
  if (video.height > 0) return `${video.height}p`;
  return video.resolution || `itag ${video.itag}`;
}

function qualityOptions(videos: VideoStreamItem[]): SabrQualityOption[] {
  const grouped = new Map<number, VideoStreamItem>();
  for (const video of videos) {
    const current = grouped.get(video.height);
    const bitrate = video.bitrate ?? 0;
    const currentBitrate = current?.bitrate ?? 0;
    if (!current || bitrate > currentBitrate) grouped.set(video.height, video);
  }
  return [...grouped.values()]
    .sort((left, right) => right.height - left.height || right.itag - left.itag)
    .map((video) => ({
      itag: video.itag,
      label: qualityLabel(video),
      height: video.height,
      descriptorUrl: toApiUrl(video.sabrSessionUrl ?? ""),
    }));
}

function pickAudio(stream: VideoStream): AudioStreamItem | null {
  const audios = stream.audioStreams ?? [];
  return audios.find((item) => isSabrCandidate(item) && item.codec === "mp4a.40.2") ?? null;
}

export function resolveSabrSessionSrc(stream: VideoStream): MediaSrc | null {
  const videos = playableVideos(stream);
  const video = videos[0] ?? null;
  if (!video?.sabrSessionUrl) return null;
  const audio = pickAudio(stream);
  const key = `${stream.id}:${video.itag}:${audio?.itag ?? "auto"}:${video.sabrSessionUrl}`;
  const id = stableId(key);
  if (!configs.has(id)) {
    configs.set(id, {
      id,
      descriptorUrl: toApiUrl(video.sabrSessionUrl),
      videoItag: video.itag,
      audioItag: audio?.itag ?? null,
      durationMs: stream.duration * 1000,
      qualities: qualityOptions(videos),
    });
  }
  return { src: `${PREFIX}${id}`, type: SABR_VIDEO_TYPE };
}

export function isSabrSessionSource(src: MediaSrc): boolean {
  return mediaSrcValue(src).startsWith(PREFIX);
}

export function sabrSessionConfig(src: MediaSrc): SabrSourceConfig | null {
  const value = mediaSrcValue(src);
  if (!value.startsWith(PREFIX)) return null;
  return configs.get(value.slice(PREFIX.length)) ?? null;
}

export function hasSabrSession(stream: VideoStream): boolean {
  return playableVideos(stream).length > 0;
}
