import type { ChannelSort } from "./api";

const YOUTUBE_CHANNEL_ID_PATTERN = /^UC[A-Za-z0-9_-]{22}$/;
const YOUTUBE_HANDLE_PATTERN = /^@[A-Za-z0-9._-]{2,48}$/;

export type ChannelPathSearch = {
  sort?: ChannelSort;
  q?: string;
  tab?: "live";
};

export type ChannelLegacySearch = ChannelPathSearch & {
  url: string;
};

function hostMatches(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

function youtubeChannelParamFromUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    if (!hostMatches(parsed.hostname.toLowerCase(), "youtube.com")) return null;
    const segments = parsed.pathname.split("/").filter(Boolean);
    const [kind, valueSegment] = segments;
    if (kind === "channel" && valueSegment && YOUTUBE_CHANNEL_ID_PATTERN.test(valueSegment)) {
      return valueSegment;
    }
    if (kind && YOUTUBE_HANDLE_PATTERN.test(kind)) return kind;
    return null;
  } catch {
    return null;
  }
}

export function toChannelSourceUrl(value: string): string {
  const trimmed = value.trim();
  if (YOUTUBE_CHANNEL_ID_PATTERN.test(trimmed)) return `https://www.youtube.com/channel/${trimmed}`;
  if (YOUTUBE_HANDLE_PATTERN.test(trimmed)) return `https://www.youtube.com/${trimmed}`;
  return trimmed;
}

function toPublicChannelParam(sourceUrl: string): string {
  return youtubeChannelParamFromUrl(sourceUrl) ?? sourceUrl.trim();
}

export function toChannelPathParam(sourceUrl: string): string | null {
  const publicParam = toPublicChannelParam(sourceUrl);
  return YOUTUBE_CHANNEL_ID_PATTERN.test(publicParam) || YOUTUBE_HANDLE_PATTERN.test(publicParam)
    ? publicParam
    : null;
}

export function channelPathSearch(
  sort: ChannelSort,
  query: string,
  live = false,
): ChannelPathSearch {
  const trimmedQuery = query.trim();
  const search: ChannelPathSearch = {};
  if (sort !== "latest") search.sort = sort;
  if (trimmedQuery.length > 0) search.q = trimmedQuery;
  if (live) search.tab = "live";
  return search;
}

export function channelLegacySearch(
  sourceUrl: string,
  sort: ChannelSort,
  query: string,
  live = false,
): ChannelLegacySearch {
  return { url: toPublicChannelParam(sourceUrl), ...channelPathSearch(sort, query, live) };
}
