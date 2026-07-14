import { useQuery } from "@tanstack/react-query";
import { fetchDeArrow, resolveDeArrowBranding } from "../lib/api-dearrow";
import { youtubeVideoId } from "../lib/watch-url";
import { useSettings } from "./use-settings";

function useDeArrow(sourceUrl: string, enabled: boolean) {
  const videoId = youtubeVideoId(sourceUrl);
  return useQuery({
    queryKey: ["dearrow", videoId],
    queryFn: () => fetchDeArrow(videoId ?? ""),
    enabled: enabled && videoId !== null,
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
}

export function useDeArrowBranding(
  sourceUrl: string,
  title: string,
  thumbnail: string,
  duration?: number,
) {
  const { settings } = useSettings();
  const item = useDeArrow(sourceUrl, settings.deArrowEnabled).data;
  return resolveDeArrowBranding(
    item,
    { title, thumbnail },
    {
      titleMode: settings.deArrowTitleMode,
      thumbnailMode: settings.deArrowThumbnailMode,
      trustMode: settings.deArrowTrustMode,
      duration,
    },
  );
}
