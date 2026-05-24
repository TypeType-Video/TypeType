import { API_BASE } from "./env";

const RAW: string = API_BASE;

function absoluteBase(): string {
  if (RAW.startsWith("http")) return RAW;
  return window.location.origin + RAW;
}

export function proxyUrl(url: string): string {
  return `${absoluteBase()}/proxy?url=${encodeURIComponent(url)}`;
}

function isRemoteUrl(url: string): boolean {
  return url.startsWith("http://") || url.startsWith("https://");
}

function extractProxyTarget(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (!parsed.pathname.endsWith("/proxy") && !parsed.pathname.endsWith("/api/proxy")) return null;
    return parsed.searchParams.get("url");
  } catch {
    return null;
  }
}

export function proxyDashManifest(url: string): string {
  if (!url) return url;
  return isRemoteUrl(url) ? proxyUrl(url) : url;
}

function needsProxy(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const host = parsed.hostname;
    return host.endsWith("hdslb.com") || host.endsWith("ytimg.com");
  } catch {
    return false;
  }
}

export function proxyImage(url: string): string {
  if (!url) return url;
  const raw = extractProxyTarget(url) ?? url;
  const normalized = raw.startsWith("httpss://") ? `https://${raw.slice(9)}` : raw;
  if (!needsProxy(normalized)) return normalized;
  return proxyUrl(normalized);
}

export function toProxiedVttUrl(url: string): string {
  const parsed = new URL(url);
  parsed.searchParams.set("fmt", "vtt");
  return proxyUrl(parsed.toString());
}
