import type { VideoStream } from "../types/stream";
import { buildDashManifest } from "./dash-manifest";
import { API_BASE as BASE } from "./env";
import { pickCompactAudioTracks } from "./stream-audio-compact";
import { pickCompatibleProgressiveSrc } from "./stream-compatibility";
import { legacyAudioStreams, legacyVideoOnlyStreams } from "./stream-delivery";
import type { MediaSrc } from "./vidstack";

export function resolveLegacyFallbackSrc(
  stream: VideoStream,
  maxHeight: number | undefined,
  compactAudioTracks: boolean,
  preferredAudioLanguage: string | undefined,
  maxCompactAudioTracks: number,
  allowServerManifests: boolean,
): MediaSrc {
  const legacyVideos = legacyVideoOnlyStreams(stream);
  const legacyAudios = legacyAudioStreams(stream);
  const audioStreams = compactAudioTracks
    ? pickCompactAudioTracks(legacyAudios, preferredAudioLanguage, maxCompactAudioTracks)
    : legacyAudios;

  if (legacyVideos.length && audioStreams.length) {
    const built = buildDashManifest(legacyVideos, audioStreams, stream.duration, maxHeight);
    if (built) return { src: built, type: "application/dash+xml" };
  }
  if (!allowServerManifests) {
    const progressiveSrc = pickCompatibleProgressiveSrc(stream);
    if (progressiveSrc) return progressiveSrc;
  }
  return {
    src: allowServerManifests
      ? `${BASE}/streams/manifest?url=${encodeURIComponent(stream.id)}`
      : "",
    type: "application/dash+xml",
  };
}
