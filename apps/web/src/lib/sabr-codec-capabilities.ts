import type { SabrQualityOption } from "../stores/sabr-quality-store";
import { defaultSabrItag } from "./sabr-source";

export type SabrCodecProbe = (
  configuration: MediaDecodingConfiguration,
) => Promise<MediaCapabilitiesDecodingInfo>;

type ScoredOption = {
  option: SabrQualityOption;
  score: number;
};

function decodingConfiguration(option: SabrQualityOption): MediaDecodingConfiguration {
  return {
    type: "media-source",
    video: {
      contentType: `${option.mimeType}; codecs="${option.codecValue}"`,
      width: Math.max(1, option.width),
      height: Math.max(1, option.height),
      bitrate: Math.max(1, option.bitrate),
      framerate: Math.max(1, option.fps),
    },
  };
}

function codecRank(option: SabrQualityOption, powerEfficient: boolean): number {
  const efficientOrder = { AV1: 3, VP9: 2, "H.264": 1 };
  const compatibilityOrder = { "H.264": 3, VP9: 2, AV1: 1 };
  return (powerEfficient ? efficientOrder : compatibilityOrder)[option.codec];
}

async function scoreOption(
  option: SabrQualityOption,
  probe: SabrCodecProbe,
): Promise<ScoredOption | null> {
  try {
    const result = await probe(decodingConfiguration(option));
    if (!result.supported) return null;
    const score = (result.powerEfficient ? 100 : 0) + (result.smooth ? 20 : 0);
    return { option, score: score + codecRank(option, result.powerEfficient) };
  } catch {
    return null;
  }
}

export async function bestSabrItag(
  options: SabrQualityOption[],
  defaultQuality: string | undefined,
  probe?: SabrCodecProbe,
): Promise<number | null> {
  const fallback = defaultSabrItag(options, defaultQuality);
  if (!probe || fallback === null) return fallback;
  const fallbackOption = options.find((option) => option.itag === fallback);
  if (!fallbackOption) return fallback;
  const candidates = options.filter((option) => option.height === fallbackOption.height);
  const scored = (await Promise.all(candidates.map((option) => scoreOption(option, probe)))).filter(
    (item): item is ScoredOption => item !== null,
  );
  scored.sort((left, right) => right.score - left.score);
  return scored[0]?.option.itag ?? fallback;
}
