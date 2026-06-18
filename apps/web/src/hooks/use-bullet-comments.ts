import { useQuery } from "@tanstack/react-query";
import { fetchBulletComments } from "../lib/api-bullet-comments";

export function useBulletComments(videoUrl: string, enabled: boolean) {
  return useQuery({
    queryKey: ["bullet-comments", videoUrl],
    queryFn: () => fetchBulletComments(videoUrl),
    enabled: enabled && videoUrl.length > 0,
    staleTime: Number.POSITIVE_INFINITY,
    select: (data) => data.comments,
  });
}
