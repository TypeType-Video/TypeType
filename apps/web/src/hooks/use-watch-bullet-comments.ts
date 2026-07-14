import { detectProvider } from "../lib/provider";
import { useBulletComments } from "./use-bullet-comments";

export function useWatchBulletComments(videoUrl: string, hideComments: boolean) {
  const isNicoNico = detectProvider(videoUrl) === "nicovideo";
  const { data: bulletComments } = useBulletComments(videoUrl, isNicoNico && !hideComments);

  return { isNicoNico, bulletComments };
}
