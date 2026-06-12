type ChannelSearchUrl = {
  channelUrl: string;
  query: string;
};

function trimTrailingSlash(value: string): string {
  const trimmed = value.trim();
  return trimmed.endsWith("/") ? trimmed.replace(/\/+$/, "") : trimmed;
}

function isYoutubeHost(hostname: string): boolean {
  return hostname === "youtube.com" || hostname.endsWith(".youtube.com");
}

function toCleanChannelUrl(parsed: URL, pathSegments: string[]): string {
  parsed.pathname = `/${pathSegments.join("/")}`;
  parsed.search = "";
  parsed.hash = "";
  return trimTrailingSlash(parsed.toString());
}

export function splitChannelSearchUrl(url: string): ChannelSearchUrl {
  const fallback = trimTrailingSlash(url);
  try {
    const parsed = new URL(fallback);
    const segments = parsed.pathname.split("/").filter(Boolean);
    const searchIndex = segments.lastIndexOf("search");
    const isSearchUrl = isYoutubeHost(parsed.hostname) && searchIndex > 0;
    const channelSegments = isSearchUrl ? segments.slice(0, searchIndex) : segments;
    const query = parsed.searchParams.get("query")?.trim() ?? "";
    return {
      channelUrl: isSearchUrl ? toCleanChannelUrl(parsed, channelSegments) : fallback,
      query: isSearchUrl ? query : "",
    };
  } catch {
    return { channelUrl: fallback, query: "" };
  }
}

export function buildChannelRequestUrl(channelUrl: string, query: string, live: boolean): string {
  const trimmedQuery = query.trim();
  if (!live && trimmedQuery.length === 0) return channelUrl;
  try {
    const parsed = new URL(splitChannelSearchUrl(channelUrl).channelUrl);
    if (!isYoutubeHost(parsed.hostname)) return channelUrl;
    parsed.pathname = `${parsed.pathname.replace(/\/+$/, "")}/${live ? "streams" : "search"}`;
    parsed.search = "";
    if (!live) parsed.searchParams.set("query", trimmedQuery);
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return channelUrl;
  }
}
