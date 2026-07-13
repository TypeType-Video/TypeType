import type { AudioStreamItem, VideoStreamItem } from "../types/api";
import type { VideoStream } from "../types/stream";
import { hasSabrSession } from "./sabr-source";

export type DeliveredStream = {
  deliveryMethod?: string | null;
  url: string;
};

function isSabrStream(item: { deliveryMethod?: string | null }): boolean {
  return item.deliveryMethod === "sabr";
}

export function hasPlayableLegacyUrl(item: DeliveredStream): boolean {
  return !isSabrStream(item) && item.url.length > 0;
}

export function legacyVideoOnlyStreams(stream: VideoStream): VideoStreamItem[] {
  return (stream.videoOnlyStreams ?? []).filter(hasPlayableLegacyUrl);
}

export function legacyAudioStreams(stream: VideoStream): AudioStreamItem[] {
  return (stream.audioStreams ?? []).filter(hasPlayableLegacyUrl);
}

export function legacyProgressiveStreams(stream: VideoStream): VideoStreamItem[] {
  return (stream.videoStreams ?? []).filter(hasPlayableLegacyUrl);
}

export function hasLegacyDashPair(stream: VideoStream): boolean {
  return legacyVideoOnlyStreams(stream).length > 0 && legacyAudioStreams(stream).length > 0;
}

export function hasSabrPlayback(stream: VideoStream): boolean {
  return hasSabrSession(stream);
}

export function hasMultipleAudioLanguages(stream: VideoStream): boolean {
  const languages = new Set<string>();
  for (const track of stream.audioStreams ?? []) {
    const [language] = (track.audioLocale ?? "").toLowerCase().split("-");
    if (!language) continue;
    languages.add(language);
    if (languages.size > 1) return true;
  }
  return false;
}
