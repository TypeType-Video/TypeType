import type { VideoStream } from "../types/stream";
import { toPublicWatchParam } from "./watch-url";

export function selectProgressiveWatchStream(
  full: VideoStream | undefined,
  bootstrap: VideoStream | undefined,
  publicParam: string,
  previewRelated: VideoStream[],
): VideoStream | undefined {
  const currentFull = full && toPublicWatchParam(full.id) === publicParam ? full : undefined;
  const currentBootstrap =
    bootstrap && toPublicWatchParam(bootstrap.id) === publicParam ? bootstrap : undefined;
  const extracted = currentFull ?? currentBootstrap;
  if (!extracted || currentFull || previewRelated.length === 0) return extracted;
  return { ...extracted, related: previewRelated };
}
