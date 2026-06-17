import type { PlaylistVideoItem } from "../types/user";

export type PlaylistSortMode =
  | "manual"
  | "added-new"
  | "added-old"
  | "posted-new"
  | "posted-old"
  | "popular";

export const PLAYLIST_SORT_OPTIONS: { value: PlaylistSortMode; label: string }[] = [
  { value: "manual", label: "Manual" },
  { value: "added-new", label: "Date added (newest)" },
  { value: "added-old", label: "Date added (oldest)" },
  { value: "posted-new", label: "Date posted (newest)" },
  { value: "posted-old", label: "Date posted (oldest)" },
  { value: "popular", label: "Popularity" },
];

export function sortPlaylistVideos(
  videos: PlaylistVideoItem[],
  mode: PlaylistSortMode,
): PlaylistVideoItem[] {
  const sorted = [...videos];
  switch (mode) {
    case "added-new":
      return sorted.sort((a, b) => (b.addedAt ?? 0) - (a.addedAt ?? 0));
    case "added-old":
      return sorted.sort((a, b) => (a.addedAt ?? 0) - (b.addedAt ?? 0));
    case "posted-new":
      return sorted.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
    case "posted-old":
      return sorted.sort((a, b) => (a.publishedAt ?? 0) - (b.publishedAt ?? 0));
    case "popular":
      return sorted.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    default:
      return sorted.sort((a, b) => a.position - b.position);
  }
}
