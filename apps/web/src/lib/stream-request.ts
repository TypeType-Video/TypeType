import { API_BASE as BASE } from "./env";
import type { PlaybackMode } from "./playback-mode";
import { detectProvider } from "./provider";

export function effectivePlaybackMode(url: string, playbackMode: PlaybackMode): PlaybackMode {
  return playbackMode === "sabr" && detectProvider(url) === "youtube" ? "sabr" : "legacy";
}

export function streamEndpoint(url: string, playbackMode: PlaybackMode): string {
  const provider = detectProvider(url);
  const path = providerStreamPath(provider, effectivePlaybackMode(url, playbackMode));
  return `${BASE}${path}?url=${encodeURIComponent(url)}`;
}

function providerStreamPath(
  provider: ReturnType<typeof detectProvider>,
  playbackMode: PlaybackMode,
) {
  if (provider === "youtube") return `/streams/youtube/${playbackMode}`;
  if (provider === "nicovideo") return "/streams/niconico";
  if (provider === "bilibili") return "/streams/bilibili";
  return "/streams/youtube/legacy";
}

export function streamQueryKey(
  url: string,
  authenticated: boolean,
  playbackMode: PlaybackMode,
): readonly ["stream", string, "auth" | "anon", PlaybackMode] {
  return ["stream", url, authenticated ? "auth" : "anon", effectivePlaybackMode(url, playbackMode)];
}
