const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const NICONICO_VIDEO_ID_PATTERN = /^sm\d+$/i;
const BILIBILI_VIDEO_ID_PATTERN = /^BV[A-Za-z0-9]{10}$/i;
const BILIBILI_WATCH_PARAM_PATTERN = /^(BV[A-Za-z0-9]{10})(?:\?p=(\d+))?$/i;

type WatchRouteSearch = {
  v: string;
};

function hostMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function youtubeIdFromPath(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  const nestedVideoPath =
    segments[0] === "shorts" || segments[0] === "embed" || segments[0] === "live";
  const candidate = nestedVideoPath ? segments[1] : segments[0];
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

function niconicoVideoIdFromUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    if (!hostMatches(parsed.hostname.toLowerCase(), "nicovideo.jp")) return null;
    const segments = parsed.pathname.split("/").filter(Boolean);
    const candidate = segments[0] === "watch" ? segments[1] : null;
    return candidate && NICONICO_VIDEO_ID_PATTERN.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

function bilibiliWatchParamFromUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    if (!hostMatches(parsed.hostname.toLowerCase(), "bilibili.com")) return null;
    const segments = parsed.pathname.split("/").filter(Boolean);
    const candidate = segments[0] === "video" ? segments[1] : null;
    if (!candidate || !BILIBILI_VIDEO_ID_PATTERN.test(candidate)) return null;
    const page = Number(parsed.searchParams.get("p") ?? "1");
    return Number.isSafeInteger(page) && page > 1 ? `${candidate}?p=${page}` : candidate;
  } catch {
    return null;
  }
}

export function youtubeVideoId(value: string): string | null {
  const trimmed = value.trim();
  return YOUTUBE_VIDEO_ID_PATTERN.test(trimmed) ? trimmed : youtubeVideoIdFromUrl(trimmed);
}

export function toWatchSourceUrl(value: string): string {
  const trimmed = value.trim();
  if (YOUTUBE_VIDEO_ID_PATTERN.test(trimmed)) {
    return `https://www.youtube.com/watch?v=${trimmed}`;
  }
  if (NICONICO_VIDEO_ID_PATTERN.test(trimmed)) {
    return `https://www.nicovideo.jp/watch/${trimmed}`;
  }
  const bilibili = trimmed.match(BILIBILI_WATCH_PARAM_PATTERN);
  if (bilibili) {
    const page = Number(bilibili[2] ?? "1");
    const suffix = Number.isSafeInteger(page) && page > 1 ? `?p=${page}` : "";
    return `https://www.bilibili.com/video/${bilibili[1]}${suffix}`;
  }
  return trimmed;
}

export function toPublicWatchParam(sourceUrl: string): string {
  return (
    youtubeVideoIdFromUrl(sourceUrl) ??
    niconicoVideoIdFromUrl(sourceUrl) ??
    bilibiliWatchParamFromUrl(sourceUrl) ??
    sourceUrl.trim()
  );
}

export function watchRouteSearch(sourceUrl: string): WatchRouteSearch {
  return { v: toPublicWatchParam(sourceUrl) };
}

export function watchListSearch(
  sourceUrl: string,
  listId?: string,
): WatchRouteSearch & {
  list?: string;
} {
  const base = watchRouteSearch(sourceUrl);
  return listId ? { ...base, list: listId } : base;
}

export function toPublicWatchUrl(sourceUrl: string, origin: string): string {
  const url = new URL("/watch", origin);
  url.searchParams.set("v", toPublicWatchParam(sourceUrl));
  return url.toString();
}
