import type { SabrQualityOption } from "../stores/sabr-quality-store";
import type { AudioStreamItem, VideoStreamItem } from "../types/api";
import type { VideoStream } from "../types/stream";
import { createSabrPlayback, type SabrPlaybackSource, seekSabrPlayback } from "./api-sabr-playback";
import type { MediaSrc } from "./vidstack";

type SabrCandidate = VideoStreamItem | AudioStreamItem;
type SabrSelection = {
  videoId: string;
  video: VideoStreamItem;
  audio: AudioStreamItem;
};

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
  const candidates = audios.filter((item) => isSabrCandidate(item) && item.codec === "mp4a.40.2");
  const preferredTrackId = stream.preferredDefaultAudioTrackId ?? stream.originalAudioTrackId;
  return candidates.find((item) => item.audioTrackId === preferredTrackId) ?? candidates[0] ?? null;
}

function searchParam(source: string | null | undefined, name: string): string | null {
  if (!source) return null;
  try {
    return new URL(source, "https://typetype.invalid").searchParams.get(name);
  } catch {
    return null;
  }
}

function videoIdFromSessionUrl(sessionUrl: string): string | null {
  try {
    const url = new URL(sessionUrl, "https://typetype.invalid");
    const prefix = "/sabr/session/";
    return url.pathname.startsWith(prefix) ? url.pathname.slice(prefix.length) : null;
  } catch {
    return null;
  }
}

function selectSabr(stream: VideoStream, selectedItag: number | null): SabrSelection | null {
  const videos = playableVideos(stream);
  const video = videos.find((item) => item.itag === selectedItag) ?? videos[0] ?? null;
  const audio = pickAudio(stream);
  if (!video?.sabrSessionUrl || !audio) return null;
  const videoId = videoIdFromSessionUrl(video.sabrSessionUrl);
  if (!videoId) return null;
  return { videoId, video, audio };
}

function playbackStartMs(playerTimeMs: number | null): number {
  if (playerTimeMs === null || !Number.isFinite(playerTimeMs)) return 0;
  return Math.max(0, Math.round(playerTimeMs));
}

export async function resolveSabrPlaybackSrc(
  stream: VideoStream,
  selectedItag: number | null,
  playerTimeMs: number | null,
  sessionId: string | null,
): Promise<SabrPlaybackSource | null> {
  const selection = selectSabr(stream, selectedItag);
  if (!selection) return null;
  const startTimeMs = playbackStartMs(playerTimeMs);
  if (sessionId && playerTimeMs !== null) {
    return seekSabrPlayback(sessionId, startTimeMs);
  }
  const audioTrackId = searchParam(selection.audio.sabrSessionUrl, "audioTrackId");
  return createSabrPlayback({
    videoId: selection.videoId,
    videoItag: selection.video.itag,
    audioItag: selection.audio.itag,
    audioTrackId,
    startTimeMs,
  });
}

export function resolveSabrSessionSrc(stream: VideoStream): MediaSrc | null {
  return selectSabr(stream, null) ? { src: "", type: "video/mp4" } : null;
}

export function hasSabrSession(stream: VideoStream): boolean {
  return playableVideos(stream).length > 0;
}
