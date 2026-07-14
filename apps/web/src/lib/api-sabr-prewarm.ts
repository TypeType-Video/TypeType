import { toAbsoluteApiUrl } from "./env";
import type { SabrPlaybackConfig } from "./sabr-source";

export async function prewarmSabrPlayback(
  config: SabrPlaybackConfig,
  token: string | null,
  signal: AbortSignal,
): Promise<void> {
  const params = new URLSearchParams({
    videoItag: String(config.videoItag),
    audioItag: String(config.audioItag),
    startTimeMs: "0",
  });
  if (config.audioTrackId) params.set("audioTrackId", config.audioTrackId);
  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
  const response = await fetch(
    toAbsoluteApiUrl(`/sabr/playback/${encodeURIComponent(config.videoId)}?${params}`),
    { method: "POST", headers, signal, cache: "no-store" },
  );
  if (!response.ok) throw new Error(`SABR prewarm failed with status ${response.status}`);
}
