import { useEffect } from "react";
import { snapToFragmentBoundary } from "../lib/fragment-boundary-seek";
import { isWebKitBrowser } from "../lib/ios-device";
import { useMediaPlayer } from "../lib/vidstack";

export function FragmentBoundarySeeker({ intervalSeconds }: { intervalSeconds?: number }) {
  const player = useMediaPlayer();

  useEffect(() => {
    if (!intervalSeconds || !isWebKitBrowser()) return;
    const root = player?.el;
    if (!root) return;
    const media = root.querySelector<HTMLMediaElement>("video,audio");
    if (!media) return;
    let adjusting = false;

    const handleSeeking = () => {
      if (adjusting) return;
      const target = snapToFragmentBoundary(media.currentTime, intervalSeconds);
      if (Math.abs(target - media.currentTime) < 0.05) return;
      adjusting = true;
      media.currentTime = target;
      queueMicrotask(() => {
        adjusting = false;
      });
    };

    media.addEventListener("seeking", handleSeeking);
    return () => media.removeEventListener("seeking", handleSeeking);
  }, [intervalSeconds, player]);

  return null;
}
