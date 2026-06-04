import type { VideoStream } from "../types/stream";
import { buildDashManifest } from "./dash-manifest";
import { API_BASE as BASE } from "./env";
import { buildNicoMasterPlaylist } from "./nico-manifest";
import { isCompatibilityPlaybackMode } from "./playback-mode";
import { detectProvider } from "./provider";
import { proxyDashManifest } from "./proxy";
import { pickCompactAudioTracks } from "./stream-audio-compact";
import type { MediaSrc } from "./vidstack";

type ResolveManifestOptions = {
  preferNativeManifest?: boolean;
  compactAudioTracks?: boolean;
  preferredAudioLanguage?: string;
  preferOriginalLanguage?: boolean;
  maxCompactAudioTracks?: number;
  compatibilityMode?: boolean;
  enableHighQualityPlayback?: boolean;
  highQualityFailed?: boolean;
};

function fallbackSrc(
  stream: VideoStream,
  maxHeight: number | undefined,
  compactAudioTracks: boolean,
  preferredAudioLanguage: string | undefined,
  maxCompactAudioTracks: number,
): MediaSrc {
  const audioStreams = compactAudioTracks
    ? pickCompactAudioTracks(
        stream.audioStreams ?? [],
        preferredAudioLanguage,
        maxCompactAudioTracks,
      )
    : (stream.audioStreams ?? []);

  if (stream.videoOnlyStreams?.length && stream.audioStreams?.length) {
    const built = buildDashManifest(
      stream.videoOnlyStreams,
      audioStreams,
      stream.duration,
      maxHeight,
    );
    if (built) return { src: built, type: "application/dash+xml" };
  }
  return {
    src: `${BASE}/streams/manifest?url=${encodeURIComponent(stream.id)}`,
    type: "application/dash+xml",
  };
}

function pickCompatibleProgressiveSrc(stream: VideoStream): MediaSrc | null {
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

function hasCompatibleMp4(stream: VideoStream): boolean {
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

export function resolveManifestSrc(
  stream: VideoStream,
  isLive: boolean,
  nativeFailed: boolean,
  qualityFailed: boolean,
  options?: ResolveManifestOptions,
): MediaSrc {
  const isShort = Boolean(stream.isShortFormContent) || stream.id.includes("/shorts/");
  const compatibilityMode = options?.compatibilityMode ?? isCompatibilityPlaybackMode();
  const preferNativeManifest = (options?.preferNativeManifest ?? !isShort) && !compatibilityMode;
  const compactAudioTracks = options?.compactAudioTracks ?? isShort;
  const maxCompactAudioTracks = options?.maxCompactAudioTracks ?? (isShort ? 3 : 8);
  const provider = detectProvider(stream.id);
  const isFirefox = typeof navigator !== "undefined" && navigator.userAgent.includes("Firefox/");

  if (stream.hlsUrl) {
    return {
      src: proxyDashManifest(`${BASE}/streams/hls-manifest?url=${encodeURIComponent(stream.id)}`),
      type: "application/x-mpegurl",
    };
  }

  if (provider === "nicovideo" && stream.videoOnlyStreams?.length) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const src = buildNicoMasterPlaylist(stream.videoOnlyStreams, stream.audioStreams ?? [], origin);
    if (src) return { src, type: "application/x-mpegurl" };
    return {
      src: proxyDashManifest(
        `${BASE}/proxy/nicovideo?url=${encodeURIComponent(stream.videoOnlyStreams[0].url)}`,
      ),
      type: "application/x-mpegurl",
    };
  }

  if (provider === "bilibili") {
    return {
      src: proxyDashManifest(`${BASE}/streams/manifest?url=${encodeURIComponent(stream.id)}`),
      type: "application/dash+xml",
    };
  }

  if (!isLive && compatibilityMode) {
    const progressiveSrc = pickCompatibleProgressiveSrc(stream);
    if (progressiveSrc) return progressiveSrc;
  }

  if (
    !isLive &&
    provider === "youtube" &&
    options?.enableHighQualityPlayback &&
    !options.highQualityFailed &&
    stream.videoOnlyStreams?.length &&
    !compatibilityMode
  ) {
    return {
      src: proxyDashManifest(`${BASE}/streams/manifest?url=${encodeURIComponent(stream.id)}`),
      type: "application/dash+xml",
    };
  }

  if (
    !isLive &&
    stream.videoOnlyStreams?.length &&
    !nativeFailed &&
    preferNativeManifest &&
    !isFirefox &&
    !compatibilityMode
  ) {
    return {
      src: proxyDashManifest(
        `${BASE}/streams/native-manifest?url=${encodeURIComponent(stream.id)}`,
      ),
      type: "application/dash+xml",
    };
  }

  if (!hasCompatibleMp4(stream)) {
    return {
      src: proxyDashManifest(`${BASE}/streams/manifest?url=${encodeURIComponent(stream.id)}`),
      type: "application/dash+xml",
    };
  }

  return fallbackSrc(
    stream,
    qualityFailed ? 720 : undefined,
    compactAudioTracks,
    options?.preferredAudioLanguage,
    maxCompactAudioTracks,
  );
}
