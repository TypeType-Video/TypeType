import type { SabrQualityOption } from "../stores/sabr-quality-store";
import type { CodecFamily } from "./quality-utils";

const SABR_CODEC_ORDER: CodecFamily[] = ["H.264", "VP9", "AV1"];

export function sabrResolutionOptions(
  options: SabrQualityOption[],
  selected: SabrQualityOption,
): SabrQualityOption[] {
  const byHeight = new Map<number, SabrQualityOption>();
  for (const option of options) {
    const current = byHeight.get(option.height);
    if (!current || option.codec === selected.codec) byHeight.set(option.height, option);
  }
  return [...byHeight.values()].sort((left, right) => right.height - left.height);
}

export function sabrCodecOptions(options: SabrQualityOption[]): CodecFamily[] {
  const available = new Set(options.map((option) => option.codec));
  return SABR_CODEC_ORDER.filter((codec) => available.has(codec));
}

export function selectSabrCodec(
  options: SabrQualityOption[],
  selected: SabrQualityOption,
  codec: CodecFamily,
): SabrQualityOption | null {
  const matching = options
    .filter((option) => option.codec === codec)
    .sort((left, right) => right.height - left.height);
  return (
    matching.find((option) => option.height === selected.height) ??
    matching.find((option) => option.height < selected.height) ??
    matching.at(-1) ??
    null
  );
}

export function maxSabrCodecHeight(options: SabrQualityOption[], codec: CodecFamily): number {
  return Math.max(
    0,
    ...options.filter((option) => option.codec === codec).map((item) => item.height),
  );
}
