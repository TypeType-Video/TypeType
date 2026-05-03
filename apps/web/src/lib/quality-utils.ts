import type { VideoQualityOption } from "./vidstack";

type CodecFamily = "H.264" | "VP9";

function codecFamily(codec: string | null): CodecFamily | null {
  if (!codec) return null;
  if (codec.startsWith("avc1")) return "H.264";
  if (codec.startsWith("vp09") || codec === "vp9") return "VP9";
  return null;
}

export function activeFamily(options: VideoQualityOption[]): CodecFamily | null {
  const selected = options.find((o) => o.selected && o.quality !== null);
  if (!selected?.quality) return null;
  return codecFamily(selected.quality.codec);
}

export function groupByFamily(options: VideoQualityOption[]): Map<CodecFamily, VideoQualityOption> {
  const groups = new Map<CodecFamily, VideoQualityOption>();
  for (const option of options) {
    if (option.quality === null) continue;
    const family = codecFamily(option.quality.codec);
    if (family && !groups.has(family)) {
      groups.set(family, option);
    }
  }
  return groups;
}
