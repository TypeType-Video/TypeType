import { useState } from "react";
import type { MediaProviderAdapter } from "../lib/vidstack";
import { isAudioProvider, isVideoProvider } from "../lib/vidstack";

export function useSabrPlayerState(
  enabled: boolean,
  onProviderChange: (provider: MediaProviderAdapter | null) => void,
) {
  const [provider, setProvider] = useState<MediaProviderAdapter | null>(null);
  const [seeking, setSeeking] = useState(false);

  const handleProviderChange = (nextProvider: MediaProviderAdapter | null) => {
    onProviderChange(nextProvider);
    setProvider(nextProvider);
  };

  const video = enabled && isVideoProvider(provider) ? provider.video : null;
  const media = isVideoProvider(provider)
    ? provider.video
    : isAudioProvider(provider)
      ? provider.audio
      : null;

  return { video, media, seeking, setSeeking, handleProviderChange };
}
