import { useEffect, useRef } from "react";
import { buildChaptersVtt } from "../lib/chapters-vtt";
import { proxyUrl } from "../lib/proxy";
import { buildThumbnailVtt } from "../lib/thumbnail-vtt";
import type { VideoStream } from "../types/stream";

export function useWatchVttAssets(stream: VideoStream) {
  const thumbnailVtt = useRef<string | null>(null);
  const chaptersVtt = useRef<string | null>(null);

  useEffect(() => {
    if (!stream.previewFrames) {
      thumbnailVtt.current = null;
      return;
    }
    const proxied = stream.previewFrames.map((frame) => ({
      ...frame,
      urls: frame.urls.map(proxyUrl),
    }));
    thumbnailVtt.current = buildThumbnailVtt(proxied);
    return () => {
      if (thumbnailVtt.current) URL.revokeObjectURL(thumbnailVtt.current);
    };
  }, [stream.previewFrames]);

  useEffect(() => {
    chaptersVtt.current = stream.streamSegments
      ? buildChaptersVtt(stream.streamSegments, stream.duration)
      : null;
    return () => {
      if (chaptersVtt.current) URL.revokeObjectURL(chaptersVtt.current);
    };
  }, [stream.streamSegments, stream.duration]);

  return {
    thumbnailVtt: thumbnailVtt.current ?? undefined,
    chaptersVtt: chaptersVtt.current ?? undefined,
  };
}
