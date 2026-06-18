import { useEffect, useRef } from "react";
import { proxyDashManifest } from "../lib/proxy";
import { resolveHlsManifestUrl } from "../lib/stream-src";
import type { VideoStream } from "../types/stream";

type Props = {
  stream: VideoStream | undefined;
  show: boolean;
};

export function VideoPreview({ stream, show }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!show || !stream || !videoRef.current) return;

    const video = videoRef.current;
    const src = resolvePreviewSrc(stream);
    if (!src) return;
    let disposed = false;
    let hls: Hls | null = null;

    if (src.type === "application/x-mpegurl") {
      void loadHls(video, src.url).then((nextHls) => {
        if (disposed) {
          nextHls?.destroy();
          return;
        }
        hls = nextHls;
      });
    } else {
      video.src = src.url;
    }

    return () => {
      disposed = true;
      hls?.destroy();
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [show, stream]);

  useEffect(() => {
    if (!videoRef.current) return;
    if (show) {
      void videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [show]);

  if (!show || !stream) return null;

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 w-full h-full object-cover"
      muted
      playsInline
      loop
    />
  );
}

type PreviewSrc = { url: string; type: "application/x-mpegurl" | "video/mp4" } | null;

function resolvePreviewSrc(stream: VideoStream): PreviewSrc {
  if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) {
    return null;
  }
  if (stream.hlsUrl) {
    return {
      url: resolveHlsManifestUrl(stream),
      type: "application/x-mpegurl",
    };
  }

  const progressive = [...(stream.videoStreams ?? [])]
    .filter((candidate) => candidate.mimeType.includes("video/mp4"))
    .sort((left, right) => (right.bitrate ?? 0) - (left.bitrate ?? 0))[0];
  if (!progressive) return null;
  return { url: proxyDashManifest(progressive.url), type: "video/mp4" };
}

type Hls = { destroy: () => void };

async function loadHls(video: HTMLVideoElement, url: string): Promise<Hls | null> {
  if (!supportsNativeHls(video)) return null;
  video.src = url;
  return {
    destroy: () => {
      video.pause();
      video.removeAttribute("src");
      video.load();
    },
  };
}

function supportsNativeHls(video: HTMLVideoElement): boolean {
  const appleType = video.canPlayType("application/vnd.apple.mpegurl");
  const legacyType = video.canPlayType("application/x-mpegURL");
  return appleType !== "" || legacyType !== "";
}
