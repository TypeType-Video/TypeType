import { useEffect } from "react";
import { recordClientEvent } from "../lib/client-debug-log";
import { mediaSrcDetails } from "../lib/player-src-debug";
import type { MediaSrc } from "../lib/vidstack";
import { onProviderChange } from "./video-player-core";

type Args = {
  src: MediaSrc;
  onError?: () => void;
  onEnded?: () => void;
};

export function useVideoPlayerEvents({ src, onError, onEnded }: Args) {
  useEffect(() => {
    recordClientEvent("player.src", mediaSrcDetails(src));
  }, [src]);

  function handleProviderChange(provider: Parameters<typeof onProviderChange>[0]) {
    recordClientEvent("player.provider_change", { present: provider !== null });
    onProviderChange(provider);
  }

  function handleError() {
    recordClientEvent("player.error", mediaSrcDetails(src));
    onError?.();
  }

  function handleEnded() {
    recordClientEvent("player.ended");
    onEnded?.();
  }

  return { handleProviderChange, handleError, handleEnded };
}
