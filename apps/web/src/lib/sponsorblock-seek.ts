import { requestSabrSeek } from "./sabr-vidstack-bridge";

export function seekSponsorBlockSegment(
  sabrVideo: HTMLVideoElement | null,
  fallback: (seconds: number) => void,
  seconds: number,
) {
  if (sabrVideo && requestSabrSeek(sabrVideo, seconds)) return;
  fallback(seconds);
}
