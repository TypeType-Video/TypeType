import { useAuthStore } from "../stores/auth-store";
import type { SabrSessionDescriptor } from "../types/sabr";
import { request } from "./api";
import { toApiUrl } from "./env";

type RawDescriptor = SabrSessionDescriptor & {
  webSocket?: string;
};

function bearerInit(): RequestInit | undefined {
  const token = useAuthStore.getState().token;
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
}

function withPlayerTimeMs(url: string, playerTimeMs: number): string {
  const parsed = new URL(url, window.location.origin);
  parsed.searchParams.set("playerTimeMs", Math.max(0, Math.round(playerTimeMs)).toString());
  return url.startsWith("http://") || url.startsWith("https://")
    ? parsed.toString()
    : `${parsed.pathname}${parsed.search}`;
}

export function toWebSocketUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("ws://") || pathOrUrl.startsWith("wss://")) return pathOrUrl;
  const url = new URL(
    pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")
      ? pathOrUrl
      : toApiUrl(pathOrUrl),
    window.location.origin,
  );
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

export async function fetchSabrSessionDescriptor(
  url: string,
  playerTimeMs: number,
): Promise<SabrSessionDescriptor> {
  const descriptor = await request<RawDescriptor>(
    withPlayerTimeMs(url, playerTimeMs),
    bearerInit(),
  );
  if (descriptor.protocol !== "typetype-sabr-ws-v1") throw new Error("unsupported_sabr_protocol");
  if (descriptor.transport !== "stateful-websocket") throw new Error("unsupported_sabr_transport");
  if (!descriptor.endpoints?.webSocket && !descriptor.webSocket) throw new Error("missing_sabr_ws");
  if (!descriptor.endpoints?.audioInit) throw new Error("missing_sabr_audio_init");
  if (!descriptor.endpoints?.videoInit) throw new Error("missing_sabr_video_init");
  return {
    ...descriptor,
    endpoints: {
      webSocket: descriptor.endpoints?.webSocket ?? descriptor.webSocket ?? "",
      audioInit: toApiUrl(descriptor.endpoints.audioInit),
      videoInit: toApiUrl(descriptor.endpoints.videoInit),
    },
  };
}

export async function fetchSabrInitSegment(url: string): Promise<Uint8Array<ArrayBuffer>> {
  const response = await fetch(url, bearerInit());
  if (!response.ok) throw new Error("sabr_init_failed");
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}
