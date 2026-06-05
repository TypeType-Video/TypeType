import type { AudioStreamItem, VideoStreamItem } from "../types/api";
import { proxyUrl } from "./proxy";

const AUDIO_GROUP_ID = "audio";
const FALLBACK_VIDEO_BANDWIDTHS = [
  [1080, 5_000_000],
  [720, 2_500_000],
  [480, 1_200_000],
  [360, 800_000],
] as const;

function encodeManifest(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function quote(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/[\r\n]/g, " ");
}

function positive(value: number | null | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function heightFromResolution(value: string): number | null {
  return positive(Number(value.match(/(\d+)\s*[pP]/)?.[1]));
}

function videoHeight(stream: VideoStreamItem): number | null {
  return positive(stream.height) ?? heightFromResolution(stream.resolution);
}

function videoResolution(stream: VideoStreamItem): string | null {
  const height = videoHeight(stream);
  const width = height === null ? null : (positive(stream.width) ?? Math.round((height * 16) / 9));
  return height === null || width === null ? null : `${width}x${height}`;
}

function bitrateBandwidth(value: number | null): number | null {
  const bitrate = positive(value);
  return bitrate === null ? null : bitrate < 10_000 ? bitrate * 1000 : bitrate;
}

function fallbackVideoBandwidth(stream: VideoStreamItem): number {
  const height = videoHeight(stream) ?? 360;
  return FALLBACK_VIDEO_BANDWIDTHS.find(([minimum]) => height >= minimum)?.[1] ?? 500_000;
}

function videoBandwidth(stream: VideoStreamItem): number {
  return bitrateBandwidth(stream.bitrate) ?? fallbackVideoBandwidth(stream);
}

function qualityBandwidth(value: string | null): number | null {
  return positive(Number(value?.match(/(\d+)/)?.[1]));
}

function audioBandwidth(stream: AudioStreamItem): number {
  const quality = qualityBandwidth(stream.quality);
  return bitrateBandwidth(stream.bitrate) ?? (quality !== null ? quality * 1000 : 128_000);
}

function audioName(stream: AudioStreamItem, index: number): string {
  return (
    [stream.audioTrackName, stream.quality ? `${stream.quality} kbps` : null].find(
      (value): value is string => typeof value === "string" && value.length > 0,
    ) ?? `Audio ${index + 1}`
  );
}

function audioMedia(stream: AudioStreamItem, index: number): string {
  const name = quote(audioName(stream, index));
  const isDefault = index === 0 ? "YES" : "NO";
  return [
    `#EXT-X-MEDIA:TYPE=AUDIO`,
    `GROUP-ID="${AUDIO_GROUP_ID}"`,
    `NAME="${name}"`,
    `DEFAULT=${isDefault}`,
    `AUTOSELECT=YES`,
    `URI="${quote(proxyUrl(stream.url))}"`,
  ].join(",");
}

function streamInfo(stream: VideoStreamItem, audio: AudioStreamItem | undefined): string {
  const bandwidth = videoBandwidth(stream) + (audio ? audioBandwidth(audio) : 0);
  const resolution = videoResolution(stream);
  const attributes = [
    `BANDWIDTH=${bandwidth}`,
    resolution ? `RESOLUTION=${resolution}` : null,
    audio ? `AUDIO="${AUDIO_GROUP_ID}"` : null,
  ].filter((attribute) => attribute !== null);
  return `#EXT-X-STREAM-INF:${attributes.join(",")}`;
}

export function buildNicoHlsManifest(
  videoStreams: VideoStreamItem[],
  audioStreams: AudioStreamItem[],
): string | null {
  const videos = videoStreams.filter((stream) => stream.url.length > 0);
  const audios = audioStreams.filter((stream) => stream.url.length > 0);
  if (videos.length === 0) return null;

  const primaryAudio = audios[0];
  const lines = ["#EXTM3U", "#EXT-X-VERSION:6", ...audios.map(audioMedia)];
  for (const video of videos) {
    lines.push(streamInfo(video, primaryAudio), proxyUrl(video.url));
  }

  const manifest = `${lines.join("\n")}\n`;
  return `data:application/vnd.apple.mpegurl;base64,${encodeManifest(manifest)}`;
}
