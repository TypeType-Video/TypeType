import { useAuthStore } from "../stores/auth-store";
import type { SabrSessionDescriptor } from "../types/sabr";
import { request } from "./api";
import { API_BASE } from "./env";

type RawDescriptor = SabrSessionDescriptor & {
  webSocket?: string;
  legacySegmentTemplate?: string;
};

export function toWebSocketUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("ws://") || pathOrUrl.startsWith("wss://")) return pathOrUrl;
  const apiUrl = new URL(API_BASE, window.location.origin);
  const url =
    pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")
      ? new URL(pathOrUrl)
      : new URL(pathOrUrl.replace(/^\//, ""), `${apiUrl.origin}/`);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}

export async function fetchSabrSessionDescriptor(url: string): Promise<SabrSessionDescriptor> {
  const token = useAuthStore.getState().token;
  const init = token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
  const descriptor = await request<RawDescriptor>(url, init);
  if (descriptor.protocol !== "typetype-sabr-ws-v1") throw new Error("unsupported_sabr_protocol");
  if (descriptor.transport !== "stateful-websocket") throw new Error("unsupported_sabr_transport");
  if (!descriptor.endpoints?.webSocket && !descriptor.webSocket) throw new Error("missing_sabr_ws");
  return {
    ...descriptor,
    endpoints: {
      webSocket: descriptor.endpoints?.webSocket ?? descriptor.webSocket ?? "",
      audioInit: descriptor.endpoints?.audioInit ?? "",
      videoInit: descriptor.endpoints?.videoInit ?? "",
      legacySegmentTemplate:
        descriptor.endpoints?.legacySegmentTemplate ?? descriptor.legacySegmentTemplate ?? "",
    },
  };
}
