import type { SabrQualityOption } from "../stores/sabr-quality-store";
import type { AudioStreamItem, VideoStreamItem } from "../types/api";
import type { VideoStream } from "../types/stream";
import { toApiUrl } from "./env";
import type { MediaSrc } from "./vidstack";

type SabrCandidate = VideoStreamItem | AudioStreamItem;

function isSabrCandidate(item: SabrCandidate): boolean {
  return item.deliveryMethod === "sabr" && Boolean(item.sabrSessionUrl?.trim());
}

function playableVideos(stream: VideoStream): VideoStreamItem[] {
  const videos = [...(stream.videoOnlyStreams ?? []), ...(stream.videoStreams ?? [])];
  return videos.filter(isSabrCandidate);
}

function qualityLabel(video: VideoStreamItem): string {
  if (video.height > 0) return `${video.height}p`;
  return video.resolution || `itag ${video.itag}`;
}

export function sabrQualityOptions(stream: VideoStream): SabrQualityOption[] {
  const grouped = new Map<number, VideoStreamItem>();
  for (const video of playableVideos(stream)) {
    const current = grouped.get(video.height);
    const bitrate = video.bitrate ?? 0;
    const currentBitrate = current?.bitrate ?? 0;
    if (!current || bitrate > currentBitrate) grouped.set(video.height, video);
  }
  return [...grouped.values()]
    .sort((left, right) => right.height - left.height || right.itag - left.itag)
    .map((video) => ({ itag: video.itag, label: qualityLabel(video), height: video.height }));
}

function pickAudio(stream: VideoStream): AudioStreamItem | null {
  const audios = stream.audioStreams ?? [];
  return audios.find((item) => isSabrCandidate(item) && item.codec === "mp4a.40.2") ?? null;
}

function searchParam(source: string | null | undefined, name: string): string | null {
  if (!source) return null;
  try {
    return new URL(source, "https://typetype.invalid").searchParams.get(name);
  } catch {
    return null;
  }
}

function directDashManifestUrl(
  sessionUrl: string,
  video: VideoStreamItem,
  audio: AudioStreamItem | null,
  playerTimeMs: number | null,
): string | null {
  try {
    const url = new URL(sessionUrl, "https://typetype.invalid");
    url.pathname = url.pathname.replace("/sabr/session/", "/sabr/manifest/");
    url.searchParams.set("format", "dash");
    url.searchParams.set("videoItag", String(video.itag));
    if (audio) {
      url.searchParams.set("audioItag", String(audio.itag));
      const audioTrackId = searchParam(audio.sabrSessionUrl, "audioTrackId");
      if (audioTrackId) url.searchParams.set("audioTrackId", audioTrackId);
    }
    if (playerTimeMs !== null) url.searchParams.set("playerTimeMs", String(playerTimeMs));
    url.searchParams.delete("session");
    return toApiUrl(`${url.pathname}${url.search}`);
  } catch {
    return null;
  }
}

export function resolveSabrSessionSrc(stream: VideoStream): MediaSrc | null {
  const video = playableVideos(stream)[0] ?? null;
  if (!video?.sabrSessionUrl) return null;
  const src = directDashManifestUrl(video.sabrSessionUrl, video, pickAudio(stream), null);
  return src ? { src, type: "application/dash+xml" } : null;
}

export async function resolveSabrHttpSessionSrc(
  stream: VideoStream,
  selectedItag: number | null,
  playerTimeMs: number | null,
): Promise<MediaSrc | null> {
  const videos = playableVideos(stream);
  const video = videos.find((item) => item.itag === selectedItag) ?? videos[0] ?? null;
  if (!video?.sabrSessionUrl) return null;
  const src = directDashManifestUrl(video.sabrSessionUrl, video, pickAudio(stream), playerTimeMs);
  return src ? { src, type: "application/dash+xml" } : null;
}

export function hasSabrSession(stream: VideoStream): boolean {
  return playableVideos(stream).length > 0;
}
