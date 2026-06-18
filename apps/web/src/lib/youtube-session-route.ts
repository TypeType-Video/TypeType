import { API_BASE } from "./env";

export function youtubeSessionReturnToForWatch(
  v: string,
  list: string | undefined,
  shuffle: string | undefined,
): string {
  const params = new URLSearchParams({ v });
  if (list) params.set("list", list);
  if (shuffle) params.set("shuffle", shuffle);
  return `/watch?${params.toString()}`;
}

export function sanitizeYoutubeSessionReturnTo(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 800 || !value.startsWith("/watch?")) {
    return undefined;
  }
  let url: URL;
  try {
    url = new URL(value, "https://typetype.invalid");
  } catch {
    return undefined;
  }
  const v = url.searchParams.get("v")?.trim();
  if (!v) return undefined;
  return youtubeSessionReturnToForWatch(
    v,
    url.searchParams.get("list") ?? undefined,
    url.searchParams.get("shuffle") ?? undefined,
  );
}

export function toYoutubeSessionWebSocketUrl(wsUrl: string): string {
  if (wsUrl.startsWith("ws://") || wsUrl.startsWith("wss://")) return wsUrl;
  const apiUrl = new URL(API_BASE, window.location.origin);
  const url =
    wsUrl.startsWith("http://") || wsUrl.startsWith("https://")
      ? new URL(wsUrl)
      : new URL(`${apiUrl.pathname.replace(/\/$/, "")}/${wsUrl.replace(/^\//, "")}`, apiUrl.origin);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  return url.toString();
}
