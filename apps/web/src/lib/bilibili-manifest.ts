import type { AudioStreamItem, VideoStreamItem } from "../types/api";
import { proxyUrl } from "./proxy";

type VideoCandidate = VideoStreamItem & { codec: string };
type AudioCandidate = AudioStreamItem & { codec: string };

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function bandwidthFromUrl(url: string): number | null {
  try {
    const value = new URL(url).searchParams.get("bw");
    if (value === null) return null;
    const bandwidth = Number(value);
    return Number.isFinite(bandwidth) && bandwidth > 0 ? bandwidth : null;
  } catch {
    return null;
  }
}

function heightFromResolution(value: string): number | null {
  const match = value.match(/(\d+)\s*[pP]/);
  if (!match) return null;
  const height = Number(match[1]);
  return Number.isFinite(height) && height > 0 ? height : null;
}

function videoDimensions(stream: VideoStreamItem): { width: number; height: number } | null {
  const height = stream.height > 0 ? stream.height : heightFromResolution(stream.resolution);
  if (height === null) return null;
  const width = stream.width > 0 ? stream.width : Math.round((height * 16) / 9);
  return { width, height };
}

function videoScore(stream: VideoCandidate): number {
  const dimensions = videoDimensions(stream);
  const height = dimensions?.height ?? 0;
  const codecPenalty = stream.codec.startsWith("avc1")
    ? 0
    : stream.codec.startsWith("av01")
      ? 10000
      : 20000;
  if (height === 480) return codecPenalty;
  if (height > 480) return codecPenalty + 1000 + height;
  return codecPenalty + 2000 + (480 - height);
}

function isSupportedCodec(mimeType: string, codec: string): boolean {
  if (typeof MediaSource === "undefined") return true;
  return MediaSource.isTypeSupported(`${mimeType}; codecs="${codec}"`);
}

function isVideoCandidate(stream: VideoStreamItem): stream is VideoCandidate {
  return typeof stream.codec === "string" && stream.codec.length > 0 && stream.url.length > 0;
}

function isAudioCandidate(stream: AudioStreamItem): stream is AudioCandidate {
  return typeof stream.codec === "string" && stream.codec.length > 0 && stream.url.length > 0;
}

function audioCodec(codec: string): string {
  return codec === "mp4a" ? "mp4a.40.2" : codec;
}

function videoCandidates(streams: VideoStreamItem[]): VideoCandidate[] {
  return [...streams]
    .filter(isVideoCandidate)
    .filter((stream) => isSupportedCodec(mimeType(stream.mimeType, "video/mp4"), stream.codec))
    .sort((left, right) => videoScore(left) - videoScore(right));
}

function audioCandidates(streams: AudioStreamItem[]): AudioCandidate[] {
  return [...streams]
    .filter(isAudioCandidate)
    .filter((stream) =>
      isSupportedCodec(mimeType(stream.mimeType, "audio/mp4"), audioCodec(stream.codec)),
    );
}

export function bilibiliVariantCount(
  videoStreams: VideoStreamItem[],
  audioStreams: AudioStreamItem[],
): number {
  return videoCandidates(videoStreams).length * audioCandidates(audioStreams).length;
}

function videoRepresentation(stream: VideoCandidate): string | null {
  const dimensions = videoDimensions(stream);
  if (dimensions === null) return null;
  const bandwidth = Math.max(1, stream.bitrate ?? bandwidthFromUrl(stream.url) ?? 1);
  const frameRate = stream.fps > 0 ? ` frameRate="${stream.fps}"` : "";
  return (
    `<Representation id="v0" bandwidth="${bandwidth}"` +
    ` width="${dimensions.width}" height="${dimensions.height}"${frameRate}` +
    ` codecs="${escapeXml(stream.codec)}">` +
    `<BaseURL>${escapeXml(proxyUrl(stream.url))}</BaseURL>` +
    `</Representation>`
  );
}

function audioRepresentation(stream: AudioCandidate): string {
  const streamBitrate = (stream.bitrate ?? 0) * 1000;
  const bandwidth = Math.max(1, streamBitrate || bandwidthFromUrl(stream.url) || 128000);
  return (
    `<Representation id="a0" bandwidth="${bandwidth}" codecs="${escapeXml(audioCodec(stream.codec))}">` +
    `<AudioChannelConfiguration` +
    ` schemeIdUri="urn:mpeg:dash:23003:3:audio_channel_configuration:2011"` +
    ` value="2"/>` +
    `<BaseURL>${escapeXml(proxyUrl(stream.url))}</BaseURL>` +
    `</Representation>`
  );
}

function mimeType(value: string, fallback: string): string {
  const [type] = value.split(";");
  const trimmed = type?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

export function buildBilibiliDashManifest(
  videoStreams: VideoStreamItem[],
  audioStreams: AudioStreamItem[],
  duration: number,
  variant = 0,
): string | null {
  if (duration <= 0) return null;
  const videos = videoCandidates(videoStreams);
  const audios = audioCandidates(audioStreams);
  if (videos.length === 0 || audios.length === 0) return null;
  const video = videos[variant % videos.length];
  const audio = audios[Math.floor(variant / videos.length) % audios.length];
  if (!video || !audio) return null;
  const videoXml = videoRepresentation(video);
  if (videoXml === null) return null;
  const audioXml = audioRepresentation(audio);
  const mpd = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<MPD xmlns="urn:mpeg:dash:schema:mpd:2011"`,
    ` profiles="urn:mpeg:dash:profile:full:2011"`,
    ` type="static" mediaPresentationDuration="PT${duration}S" minBufferTime="PT4S">`,
    `<Period>`,
    `<AdaptationSet mimeType="${escapeXml(mimeType(video.mimeType, "video/mp4"))}" startWithSAP="1">`,
    videoXml,
    `</AdaptationSet>`,
    `<AdaptationSet mimeType="${escapeXml(mimeType(audio.mimeType, "audio/mp4"))}" lang="und" startWithSAP="1">`,
    audioXml,
    `</AdaptationSet>`,
    `</Period>`,
    `</MPD>`,
  ].join("");
  return `data:application/dash+xml;base64,${btoa(mpd)}`;
}
