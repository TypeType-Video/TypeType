import type { SabrQualityOption } from "../stores/sabr-quality-store";
import type { AudioStreamItem, VideoStreamItem } from "../types/api";
import type { VideoStream } from "../types/stream";
import { type CodecFamily, codecFamily } from "./quality-utils";
import type { MediaSrc } from "./vidstack";

type SabrCandidate = VideoStreamItem | AudioStreamItem;
type SabrSelection = {
  videoId: string;
  video: VideoStreamItem;
  audio: AudioStreamItem;
};

export type SabrPlaybackConfig = {
  key: string;
  videoId: string;
  videoItag: number;
  audioItag: number;
  audioTrackId: string | null;
};

function isSabrCandidate(item: SabrCandidate): boolean {
  return item.deliveryMethod === "sabr" && Boolean(item.sabrSessionUrl?.trim());
}

function playableVideos(stream: VideoStream): VideoStreamItem[] {
  const videos = [...(stream.videoOnlyStreams ?? []), ...(stream.videoStreams ?? [])];
  return videos.filter((video) => isSabrCandidate(video) && supportedVideo(video));
}

function supportedVideo(video: VideoStreamItem): boolean {
  if (!video.codec || !codecFamily(video.codec)) return false;
  if (typeof MediaSource === "undefined") return true;
  return MediaSource.isTypeSupported(`${video.mimeType}; codecs="${video.codec}"`);
}

function qualityLabel(video: VideoStreamItem): string {
  if (video.height > 0) return `${video.height}p`;
  return video.resolution || `itag ${video.itag}`;
}

export function sabrQualityOptions(stream: VideoStream): SabrQualityOption[] {
  const grouped = new Map<string, { video: VideoStreamItem; codec: CodecFamily }>();
  for (const video of playableVideos(stream)) {
    const codec = codecFamily(video.codec);
    if (!codec) continue;
    const key = `${video.height}:${codec}`;
    const current = grouped.get(key)?.video;
    const bitrate = video.bitrate ?? 0;
    const currentBitrate = current?.bitrate ?? 0;
    if (!current || bitrate > currentBitrate) grouped.set(key, { video, codec });
  }
  return [...grouped.values()]
    .sort(
      (left, right) => right.video.height - left.video.height || right.video.itag - left.video.itag,
    )
    .map(({ video, codec }) => ({
      itag: video.itag,
      label: qualityLabel(video),
      height: video.height,
      codec,
      codecValue: video.codec ?? "",
      mimeType: video.mimeType,
      width: video.width,
      fps: video.fps,
      bitrate: video.bitrate ?? 1,
    }));
}

export function defaultSabrItag(
  options: SabrQualityOption[],
  defaultQuality: string | undefined,
): number | null {
  if (options.length === 0) return null;
  const defaultHeight = defaultQuality ? Number.parseInt(defaultQuality, 10) : 720;
  const stableHeight = Math.min(Number.isFinite(defaultHeight) ? defaultHeight : 720, 720);
  const targetHeight = options.find((option) => option.height <= stableHeight)?.height;
  const preferred = ["H.264", "VP9", "AV1"].flatMap((codec) =>
    options.filter((option) => option.height === targetHeight && option.codec === codec),
  )[0];
  return preferred?.itag ?? options.at(-1)?.itag ?? null;
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

export function resolveSabrPlaybackConfig(
  stream: VideoStream,
  selectedItag: number | null,
): SabrPlaybackConfig | null {
  const selection = selectSabr(stream, selectedItag);
  if (!selection) return null;
  const audioTrackId = searchParam(selection.audio.sabrSessionUrl, "audioTrackId");
  return {
    key: `${selection.videoId}:${selection.video.itag}:${selection.audio.itag}:${audioTrackId ?? "main"}`,
    videoId: selection.videoId,
    videoItag: selection.video.itag,
    audioItag: selection.audio.itag,
    audioTrackId,
  };
}

export function resolveSabrSessionSrc(stream: VideoStream): MediaSrc | null {
  return selectSabr(stream, null) ? { src: "", type: "video/mp4" } : null;
}

export function hasSabrSession(stream: VideoStream): boolean {
  return playableVideos(stream).length > 0;
}
