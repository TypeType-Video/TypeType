const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

type WatchRouteSearch = {
  v: string;
  t?: number;
};

function hostMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function youtubeIdFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const candidate = segments[0] === "shorts" || segments[0] === "embed" ? segments[1] : segments[0];
  return candidate && YOUTUBE_VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
}

function youtubeVideoIdFromUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    if (host === "youtu.be") return youtubeIdFromPath(parsed.pathname);
    if (!hostMatches(host, "youtube.com")) return null;
    const watchId = parsed.searchParams.get("v");
    if (watchId && YOUTUBE_VIDEO_ID_PATTERN.test(watchId)) return watchId;
    return youtubeIdFromPath(parsed.pathname);
  } catch {
    return null;
  }
}

export function toWatchSourceUrl(value: string): string {
  const trimmed = value.trim();
  if (YOUTUBE_VIDEO_ID_PATTERN.test(trimmed)) {
    return `https://www.youtube.com/watch?v=${trimmed}`;
  }
  return trimmed;
}

export function toPublicWatchParam(sourceUrl: string): string {
  return youtubeVideoIdFromUrl(sourceUrl) ?? sourceUrl.trim();
}

export function watchRouteSearch(sourceUrl: string): WatchRouteSearch {
  return { v: toPublicWatchParam(sourceUrl) };
}

export function toPublicWatchUrl(sourceUrl: string, origin: string, startSeconds?: number): string {
  const url = new URL("/watch", origin);
  url.searchParams.set("v", toPublicWatchParam(sourceUrl));
  if (typeof startSeconds === "number" && Number.isFinite(startSeconds) && startSeconds > 0) {
    url.searchParams.set("t", String(Math.floor(startSeconds)));
  }
  return url.toString();
}
