import { API_BASE as BASE, toApiUrl } from "./env";

export type DeArrowItem = {
  videoId: string;
  title: string | null;
  thumbnailUrl: string | null;
  attributionUrl: string;
};

export type DeArrowBranding = {
  title: string;
  thumbnail: string;
};

export function resolveDeArrowBranding(
  item: DeArrowItem | undefined,
  fallback: DeArrowBranding,
): DeArrowBranding {
  return {
    title: item?.title ?? fallback.title,
    thumbnail: item?.thumbnailUrl ?? fallback.thumbnail,
  };
}

export async function fetchDeArrow(videoId: string): Promise<DeArrowItem> {
  const response = await fetch(`${BASE}/dearrow?videoId=${encodeURIComponent(videoId)}`);
  if (!response.ok) throw new Error("DeArrow metadata unavailable");
  const item: DeArrowItem = await response.json();
  return {
    ...item,
    title: item.title ?? null,
    thumbnailUrl: item.thumbnailUrl ? toApiUrl(item.thumbnailUrl) : null,
  };
}
