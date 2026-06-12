import { useEffect, useState } from "react";
import { buildChaptersVtt, buildSponsorBlockChaptersVtt } from "../lib/chapters-vtt";
import { proxyUrl } from "../lib/proxy";
import { buildThumbnailVtt } from "../lib/thumbnail-vtt";
import type { SponsorBlockSegmentItem } from "../types/api";
import type { VideoStream } from "../types/stream";

export function useWatchVttAssets(
  stream: VideoStream,
  sponsorBlockSegments: SponsorBlockSegmentItem[] | undefined,
  showSponsorBlockChapters: boolean,
) {
  const [thumbnailVtt, setThumbnailVtt] = useState<string | null>(null);
  const [chaptersVtt, setChaptersVtt] = useState<string | null>(null);

  useEffect(() => {
    if (!stream.previewFrames) {
      setThumbnailVtt(null);
      return;
    }
    const proxied = stream.previewFrames.map((frame) => ({
      ...frame,
      urls: frame.urls.map(proxyUrl),
    }));
    const vtt = buildThumbnailVtt(proxied);
    setThumbnailVtt(vtt);
    return () => {
      if (vtt) {
        URL.revokeObjectURL(vtt);
      }
    };
  }, [stream.previewFrames]);

  useEffect(() => {
    const vtt = stream.streamSegments
      ? buildChaptersVtt(stream.streamSegments, stream.duration)
      : showSponsorBlockChapters
        ? buildSponsorBlockChaptersVtt(sponsorBlockSegments ?? [], stream.duration)
        : null;
    setChaptersVtt(vtt);
    return () => {
      if (vtt) URL.revokeObjectURL(vtt);
    };
  }, [stream.streamSegments, stream.duration, sponsorBlockSegments, showSponsorBlockChapters]);

  return {
    thumbnailVtt: thumbnailVtt ?? undefined,
    chaptersVtt: chaptersVtt ?? undefined,
  };
}
