import type { ChannelSort } from "./api-discovery";

export const CHANNEL_SORT_OPTIONS: { value: ChannelSort; label: string }[] = [
  { value: "latest", label: "Newest" },
  { value: "popular", label: "Popular" },
  { value: "oldest", label: "Oldest" },
];

function toChannelSort(value: unknown): ChannelSort | undefined {
  if (value === "latest" || value === "newest") return "latest";
  if (value === "popular") return "popular";
  if (value === "oldest" || value === "old") return "oldest";
  return undefined;
}

export function channelSortOrDefault(value: unknown): ChannelSort {
  return toChannelSort(value) ?? "latest";
}
