import { requestSabrRootPlayback } from "../lib/sabr-vidstack-bridge";
import { useMediaPlayer, useMediaRemote, useMediaState } from "../lib/vidstack";

export function AudioCenterToggle({ sabr = false }: { sabr?: boolean }) {
  const player = useMediaPlayer();
  const remote = useMediaRemote();
  const paused = useMediaState("paused");
  const label = paused ? "Play audio" : "Pause audio";

  const togglePlayback = async () => {
    if (sabr && (await requestSabrRootPlayback(player?.el ?? null, paused))) return;
    if (paused) await remote.play();
    else await remote.pause();
  };

  return (
    <button
      type="button"
      className="typetype-audio-center-toggle"
      aria-label={label}
      onClick={() => void togglePlayback().catch(() => {})}
    />
  );
}
