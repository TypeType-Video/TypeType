import type { MediaSrc } from "./vidstack";

export function adaptiveSourceNeedsVideoProvider(src: MediaSrc): boolean {
  if (!src || typeof src === "string" || Array.isArray(src) || !("type" in src)) return false;
  const type = String(src.type).toLowerCase();
  return type.includes("mpegurl") || type.includes("dash+xml");
}

export function mediaSourceViewType(
  audioOnly: boolean,
  sabr: boolean,
  src: MediaSrc,
): "audio" | "video" {
  return audioOnly && !sabr && !adaptiveSourceNeedsVideoProvider(src) ? "audio" : "video";
}
