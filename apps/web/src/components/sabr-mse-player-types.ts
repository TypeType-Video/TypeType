import type { SabrPlaybackConfig } from "../lib/sabr-source";

export type SabrMsePlayerProps = {
  config: SabrPlaybackConfig;
  video: HTMLVideoElement | null;
  startTime: number;
  autoplay: boolean;
  initialVolume: number;
  initialMuted: boolean;
  settingsReady: boolean;
  onVolumeChange?: (volume: number, muted: boolean) => void;
  onError: () => void;
  onSeekStateChange: (seeking: boolean) => void;
  onSeekReady: (seek: (seconds: number) => void) => void;
  onPositionReaderChange: (reader: (() => number | null) | null) => void;
};
