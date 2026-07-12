import { useState } from "react";
import type { MediaProviderAdapter } from "../lib/vidstack";
import { isVideoProvider } from "../lib/vidstack";

export function useSabrPlayerState(
  enabled: boolean,
  onProviderChange: (provider: MediaProviderAdapter | null) => void,
) {
  const [provider, setProvider] = useState<MediaProviderAdapter | null>(null);
  const [seeking, setSeeking] = useState(false);

  const handleProviderChange = (nextProvider: MediaProviderAdapter | null) => {
    onProviderChange(nextProvider);
    setProvider(enabled && isVideoProvider(nextProvider) ? nextProvider : null);
  };

  return { provider, seeking, setSeeking, handleProviderChange };
}
