import type { DeArrowThumbnailMode, DeArrowTitleMode, DeArrowTrustMode } from "../types/user";
import { API_BASE as BASE, toApiUrl } from "./env";

type DeArrowCandidate = {
  original: boolean;
  votes: number;
  locked: boolean;
  uuid: string;
};

type DeArrowTitleCandidate = DeArrowCandidate & { title: string };
type DeArrowThumbnailCandidate = DeArrowCandidate & {
  timestamp: number | null;
  thumbnailUrl: string | null;
};

export type DeArrowItem = {
  videoId: string;
  title: string | null;
  thumbnailUrl: string | null;
  titles?: DeArrowTitleCandidate[];
  thumbnails?: DeArrowThumbnailCandidate[];
  randomTime?: number | null;
  videoDuration?: number | null;
  attributionUrl: string;
};

export type DeArrowBranding = {
  title: string;
  thumbnail: string;
};

export type DeArrowPreferences = {
  titleMode: DeArrowTitleMode;
  thumbnailMode: DeArrowThumbnailMode;
  trustMode: DeArrowTrustMode;
  duration?: number;
};

function trusted(candidate: DeArrowCandidate, mode: DeArrowTrustMode): boolean {
  return mode === "locked" ? candidate.locked : candidate.locked || candidate.votes >= 0;
}

function randomThumbnail(item: DeArrowItem, duration?: number): string | null {
  const videoDuration =
    item.videoDuration && item.videoDuration > 0 ? item.videoDuration : duration;
  if (!item.randomTime || !videoDuration || videoDuration <= 0) return null;
  const time = item.randomTime * videoDuration;
  return toApiUrl(`/dearrow/thumbnail?videoId=${item.videoId}&time=${time}`);
}

export function resolveDeArrowBranding(
  item: DeArrowItem | undefined,
  fallback: DeArrowBranding,
  preferences: DeArrowPreferences = {
    titleMode: "dearrow",
    thumbnailMode: "dearrow",
    trustMode: "accepted",
  },
): DeArrowBranding {
  if (!item) return fallback;
  const titleCandidate = item.titles?.find((candidate) =>
    trusted(candidate, preferences.trustMode),
  );
  const thumbnailCandidate = item.thumbnails?.find((candidate) =>
    trusted(candidate, preferences.trustMode),
  );
  const title =
    preferences.titleMode === "original"
      ? fallback.title
      : titleCandidate
        ? titleCandidate.original
          ? fallback.title
          : titleCandidate.title
        : item.titles === undefined && preferences.trustMode === "accepted"
          ? (item.title ?? fallback.title)
          : fallback.title;
  const communityThumbnail = thumbnailCandidate
    ? thumbnailCandidate.original
      ? fallback.thumbnail
      : (thumbnailCandidate.thumbnailUrl ?? fallback.thumbnail)
    : item.thumbnails === undefined && preferences.trustMode === "accepted"
      ? item.thumbnailUrl
      : null;
  const neutralThumbnail = randomThumbnail(item, preferences.duration);
  let thumbnail = fallback.thumbnail;
  if (preferences.thumbnailMode === "dearrow") thumbnail = communityThumbnail ?? fallback.thumbnail;
  if (preferences.thumbnailMode === "random") thumbnail = neutralThumbnail ?? fallback.thumbnail;
  if (preferences.thumbnailMode === "dearrow_or_random") {
    thumbnail = communityThumbnail ?? neutralThumbnail ?? fallback.thumbnail;
  }
  return {
    title,
    thumbnail,
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
    thumbnails: item.thumbnails?.map((candidate) => ({
      ...candidate,
      thumbnailUrl: candidate.thumbnailUrl ? toApiUrl(candidate.thumbnailUrl) : null,
    })),
  };
}
