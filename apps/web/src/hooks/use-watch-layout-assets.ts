import { useEffect, useRef, useState } from "react";
import { buildChaptersVtt, buildSponsorBlockChaptersVtt } from "../lib/chapters-vtt";
import { proxyUrl } from "../lib/proxy";
import { buildThumbnailVtt } from "../lib/thumbnail-vtt";
import type { SponsorBlockSegmentItem } from "../types/api";
import type { VideoStream } from "../types/stream";

function previewFramesKey(stream: VideoStream): string {
  return (stream.previewFrames ?? [])
    .map(
      (frame) =>
        `${frame.frameWidth}:${frame.frameHeight}:${frame.durationPerFrame}:${frame.urls.join(",")}`,
    )
    .join("|");
}

function streamSegmentsKey(stream: VideoStream): string {
  return (stream.streamSegments ?? [])
    .map((segment) => `${segment.startTimeSeconds}:${segment.title}`)
    .join("|");
}

function sponsorBlockSegmentsKey(segments: SponsorBlockSegmentItem[] | undefined): string {
  return (segments ?? [])
    .map(
      (segment) => `${segment.startTime}:${segment.endTime}:${segment.category}:${segment.action}`,
    )
    .join("|");
}

export function useWatchVttAssets(
  stream: VideoStream,
  sponsorBlockSegments: SponsorBlockSegmentItem[] | undefined,
  showSponsorBlockChapters: boolean,
) {
  const [thumbnailVtt, setThumbnailVtt] = useState<string | null>(null);
  const [chaptersVtt, setChaptersVtt] = useState<string | null>(null);
  const thumbnailAssetRef = useRef<{ key: string; vtt: string | null }>({ key: "", vtt: null });
  const chaptersAssetRef = useRef<{ key: string; vtt: string | null }>({ key: "", vtt: null });
  const thumbnailKey = previewFramesKey(stream);
  const chaptersKey = streamSegmentsKey(stream);
  const sponsorChaptersKey = sponsorBlockSegmentsKey(sponsorBlockSegments);

  useEffect(() => {
    if (thumbnailAssetRef.current.key === thumbnailKey) return;
    const previousVtt = thumbnailAssetRef.current.vtt;
    if (!stream.previewFrames) {
      thumbnailAssetRef.current = { key: thumbnailKey, vtt: null };
      setThumbnailVtt(null);
      if (previousVtt) URL.revokeObjectURL(previousVtt);
      return;
    }
    const proxied = stream.previewFrames.map((frame) => ({
      ...frame,
      urls: frame.urls.map(proxyUrl),
    }));
    const vtt = buildThumbnailVtt(proxied);
    thumbnailAssetRef.current = { key: thumbnailKey, vtt };
    setThumbnailVtt(vtt);
    if (previousVtt) URL.revokeObjectURL(previousVtt);
  }, [stream.previewFrames, thumbnailKey]);

  useEffect(() => {
    const key = `${showSponsorBlockChapters}:${stream.duration}:${chaptersKey}:${sponsorChaptersKey}`;
    if (chaptersAssetRef.current.key === key) return;
    const vtt = stream.streamSegments
      ? buildChaptersVtt(stream.streamSegments, stream.duration)
      : showSponsorBlockChapters
        ? buildSponsorBlockChaptersVtt(sponsorBlockSegments ?? [], stream.duration)
        : null;
    const previousVtt = chaptersAssetRef.current.vtt;
    chaptersAssetRef.current = { key, vtt };
    setChaptersVtt(vtt);
    if (previousVtt) URL.revokeObjectURL(previousVtt);
  }, [
    chaptersKey,
    stream.duration,
    stream.streamSegments,
    sponsorBlockSegments,
    sponsorChaptersKey,
    showSponsorBlockChapters,
  ]);

  useEffect(() => {
    return () => {
      if (thumbnailAssetRef.current.vtt) URL.revokeObjectURL(thumbnailAssetRef.current.vtt);
      if (chaptersAssetRef.current.vtt) URL.revokeObjectURL(chaptersAssetRef.current.vtt);
    };
  }, []);

  return {
    thumbnailVtt: thumbnailVtt ?? undefined,
    chaptersVtt: chaptersVtt ?? undefined,
  };
}
