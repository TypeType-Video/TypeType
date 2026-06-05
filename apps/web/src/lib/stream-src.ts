import type { VideoStream } from "../types/stream";
import { buildBilibiliDashManifest } from "./bilibili-manifest";
import { buildDashManifest } from "./dash-manifest";
import { API_BASE as BASE } from "./env";
import { isCompatibilityPlaybackMode } from "./playback-mode";
import { detectProvider } from "./provider";
import { proxyDashManifest } from "./proxy";
import { pickCompactAudioTracks } from "./stream-audio-compact";
import { hasCompatibleMp4, pickCompatibleProgressiveSrc } from "./stream-compatibility";
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
  bilibiliVariant?: number;
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

function pickNicoHlsUrl(stream: VideoStream): string | null {
  return stream.videoOnlyStreams?.[0]?.url ?? stream.audioStreams?.[0]?.url ?? null;
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

  if (provider === "nicovideo") {
    const hlsUrl = pickNicoHlsUrl(stream);
    if (hlsUrl) return { src: proxyDashManifest(hlsUrl), type: "application/x-mpegurl" };
  }

  if (provider === "bilibili") {
    const built = buildBilibiliDashManifest(
      stream.videoOnlyStreams ?? [],
      stream.audioStreams ?? [],
      stream.duration,
      options?.bilibiliVariant,
    );
    return {
      src:
        built ?? proxyDashManifest(`${BASE}/streams/manifest?url=${encodeURIComponent(stream.id)}`),
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
