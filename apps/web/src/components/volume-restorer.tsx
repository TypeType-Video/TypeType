import { useEffect, useRef } from "react";
import { useMediaPlayer, useMediaRemote, useMediaState } from "../lib/vidstack";

type Props = {
  initialVolume: number;
  initialMuted: boolean;
  settingsReady: boolean;
  onVolumeChange?: (volume: number, muted: boolean) => void;
};

export function VolumeRestorer({
  initialVolume,
  initialMuted,
  settingsReady,
  onVolumeChange,
}: Props) {
  const remote = useMediaRemote();
  const player = useMediaPlayer();
  const volume = useMediaState("volume");
  const muted = useMediaState("muted");
  const canPlay = useMediaState("canPlay");
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!settingsReady || !canPlay || restoredRef.current) return;
    const root = player?.el;
    if (!root?.isConnected) return;
    restoredRef.current = true;
    try {
      remote.changeVolume(initialVolume);
      if (initialMuted) remote.mute();
    } catch {
      restoredRef.current = false;
    }
  }, [settingsReady, canPlay, remote, initialVolume, initialMuted, player]);

  useEffect(() => {
    if (!restoredRef.current) return;
    onVolumeChange?.(volume, muted);
  }, [volume, muted, onVolumeChange]);

  return null;
}
