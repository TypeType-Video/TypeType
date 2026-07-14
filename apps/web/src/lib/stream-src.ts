import type { VideoStream } from "../types/stream";
import { buildBilibiliDashManifest } from "./bilibili-manifest";
import { API_BASE as BASE, toApiUrl } from "./env";
import { buildNicoHlsManifest } from "./nico-hls-manifest";
import { detectProvider } from "./provider";
import { proxyDashManifest } from "./proxy";
import { hasCompatibleMp4, pickCompatibleProgressiveSrc } from "./stream-compatibility";
import { hasLegacyDashPair } from "./stream-delivery";
import { resolveLegacyFallbackSrc } from "./stream-fallback-src";
import type { MediaSrc } from "./vidstack";

type ResolveManifestOptions = {
  compactAudioTracks?: boolean;
  preferredAudioLanguage?: string;
  preferOriginalLanguage?: boolean;
  maxCompactAudioTracks?: number;
  compatibilityMode?: boolean;
  enableHighQualityPlayback?: boolean;
  highQualityFailed?: boolean;
  hlsFailed?: boolean;
  allowServerManifests?: boolean;
  bilibiliVariant?: number;
};

export function isSignedHlsManifestUrl(value: string): boolean {
  try {
    const url = new URL(value, "https://typetype.invalid");
    return url.pathname.endsWith("/streams/hls-manifest") && url.searchParams.has("token");
  } catch {
    return false;
  }
}

export function resolveHlsManifestUrl(stream: VideoStream): string {
  if (stream.hlsUrl && isSignedHlsManifestUrl(stream.hlsUrl)) return toApiUrl(stream.hlsUrl);
  return proxyDashManifest(`${BASE}/streams/hls-manifest?url=${encodeURIComponent(stream.id)}`);
}

export function shouldUseClassicHls(
  hlsUrl: string | undefined,
  isLive: boolean,
  hlsFailed: boolean,
  legacyDashPair: boolean,
): boolean {
  return Boolean(
    hlsUrl && !hlsFailed && (isLive || isSignedHlsManifestUrl(hlsUrl) || !legacyDashPair),
  );
}

export function resolveManifestSrc(
  stream: VideoStream,
  isLive: boolean,
  qualityFailed: boolean,
  options?: ResolveManifestOptions,
): MediaSrc {
  const isShort = Boolean(stream.isShortFormContent) || stream.id.includes("/shorts/");
  const compatibilityMode = options?.compatibilityMode ?? false;
  const compactAudioTracks = options?.compactAudioTracks ?? isShort;
  const maxCompactAudioTracks = options?.maxCompactAudioTracks ?? (isShort ? 3 : 8);
  const allowServerManifests = options?.allowServerManifests ?? true;
  const provider = detectProvider(stream.id);
  const safeMaxHeight = qualityFailed ? 720 : 1080;
  const legacyDashPair = hasLegacyDashPair(stream);
  const allowLegacyServerManifests = allowServerManifests;

  if (shouldUseClassicHls(stream.hlsUrl, isLive, options?.hlsFailed ?? false, legacyDashPair)) {
    return {
      src: resolveHlsManifestUrl(stream),
      type: "application/x-mpegurl",
    };
  }

  if (provider === "nicovideo") {
    const built = buildNicoHlsManifest(stream.videoOnlyStreams ?? [], stream.audioStreams ?? []);
    if (built) return { src: built, type: "application/x-mpegurl" };
  }

  if (provider === "bilibili") {
    const built = buildBilibiliDashManifest(
      stream.videoOnlyStreams ?? [],
      stream.audioStreams ?? [],
      stream.duration,
      options?.bilibiliVariant,
    );
    if (built) return { src: built, type: "application/dash+xml" };
    if (allowServerManifests) {
      return {
        src: proxyDashManifest(`${BASE}/streams/manifest?url=${encodeURIComponent(stream.id)}`),
        type: "application/dash+xml",
      };
    }
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
    allowLegacyServerManifests &&
    legacyDashPair &&
    !compatibilityMode
  ) {
    return {
      src: proxyDashManifest(`${BASE}/streams/manifest?url=${encodeURIComponent(stream.id)}`),
      type: "application/dash+xml",
    };
  }

  if (!hasCompatibleMp4(stream) && allowLegacyServerManifests) {
    return {
      src: proxyDashManifest(`${BASE}/streams/manifest?url=${encodeURIComponent(stream.id)}`),
      type: "application/dash+xml",
    };
  }

  return resolveLegacyFallbackSrc(
    stream,
    safeMaxHeight,
    compactAudioTracks,
    options?.preferredAudioLanguage,
    maxCompactAudioTracks,
    allowLegacyServerManifests,
  );
}
