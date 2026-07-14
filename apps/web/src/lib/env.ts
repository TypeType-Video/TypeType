export const API_BASE: string = import.meta.env.VITE_API_URL ?? "/api";

function joinPath(base: string, path: string): string {
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function toApiUrl(pathOrUrl: string): string {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }
  return joinPath(API_BASE, pathOrUrl);
}

export function toAbsoluteApiUrl(pathOrUrl: string): string {
  return new URL(toApiUrl(pathOrUrl), window.location.origin).href;
}
