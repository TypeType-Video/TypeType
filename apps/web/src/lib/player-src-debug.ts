import type { VideoPlayerProps } from "../components/video-player-types";
import { sanitizeRequestPath } from "./debug-sanitize";
import { isSignedHlsManifestUrl } from "./stream-src";

export function mediaSrcDetails(src: VideoPlayerProps["src"]) {
  if (typeof src === "string") {
    return {
      kind: "string",
      path: sanitizeRequestPath(src),
      signedHls: isSignedHlsManifestUrl(src),
    };
  }
  if (Array.isArray(src)) return { kind: "array", count: src.length };
  if (src && typeof src === "object" && "src" in src) {
    const rawSrc = typeof src.src === "string" ? src.src : "";
    const type = "type" in src && typeof src.type === "string" ? src.type : null;
    return {
      kind: "object",
      type,
      path: sanitizeRequestPath(rawSrc),
      signedHls: isSignedHlsManifestUrl(rawSrc),
    };
  }
  return { kind: "unknown" };
}
