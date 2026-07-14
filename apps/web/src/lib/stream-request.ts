import { API_BASE as BASE } from "./env";
import type { PlaybackMode } from "./playback-mode";
import { detectProvider } from "./provider";

function effectivePlaybackMode(url: string, playbackMode: PlaybackMode): PlaybackMode {
  return playbackMode === "sabr" && detectProvider(url) === "youtube" ? "sabr" : "legacy";
}

export function streamEndpoint(url: string, playbackMode: PlaybackMode): string {
  const provider = detectProvider(url);
  const path = providerStreamPath(provider, effectivePlaybackMode(url, playbackMode));
  return `${BASE}${path}?url=${encodeURIComponent(url)}`;
}

export function sabrBootstrapEndpoint(url: string): string | null {
  if (detectProvider(url) !== "youtube") return null;
  return `${BASE}/streams/youtube/sabr/bootstrap?url=${encodeURIComponent(url)}`;
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

export function sabrBootstrapQueryKey(
  url: string,
  authenticated: boolean,
): readonly ["stream-bootstrap", string, "auth" | "anon"] {
  return ["stream-bootstrap", url, authenticated ? "auth" : "anon"];
}
