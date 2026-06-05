import type { VideoStream } from "../types/stream";
import { proxyDashManifest } from "./proxy";
import type { MediaSrc } from "./vidstack";

export function pickCompatibleProgressiveSrc(stream: VideoStream): MediaSrc | null {
  const progressive = [...(stream.videoStreams ?? [])]
    .filter(
      (candidate) =>
        typeof candidate.codec === "string" &&
        candidate.codec.includes("avc1") &&
        candidate.codec.includes("mp4a") &&
        candidate.mimeType.includes("video/mp4"),
    )
    .sort((left, right) => (right.bitrate ?? 0) - (left.bitrate ?? 0))[0];

  if (!progressive) return null;
  return {
    src: proxyDashManifest(progressive.url),
    type: "video/mp4",
  };
}

export function hasCompatibleMp4(stream: VideoStream): boolean {
  const videos = stream.videoOnlyStreams ?? [];
  const audios = stream.audioStreams ?? [];
  const hasMp4Video = videos.some(
    (video) =>
      typeof video.codec === "string" &&
      video.codec.startsWith("avc1") &&
      (video.mimeType?.includes("video/mp4") ?? true),
  );
  const hasMp4Audio = audios.some(
    (audio) =>
      typeof audio.codec === "string" &&
      (audio.codec.startsWith("mp4a") || audio.codec === "mp4a") &&
      (audio.mimeType?.includes("audio/mp4") ?? true),
  );
  return hasMp4Video && hasMp4Audio;
}
