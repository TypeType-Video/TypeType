import { requestSabrRootPlayback } from "../lib/sabr-vidstack-bridge";
import { useMediaPlayer, useMediaRemote, useMediaState } from "../lib/vidstack";
import { AudioPauseIcon, AudioPlayIcon } from "./audio-control-icons";

export function AudioPlayButton({ sabr = false }: { sabr?: boolean }) {
  const player = useMediaPlayer();
  const remote = useMediaRemote();
  const paused = useMediaState("paused");
  const Icon = paused ? AudioPlayIcon : AudioPauseIcon;
  const label = paused ? "Play" : "Pause";

  const togglePlayback = async () => {
    if (sabr && (await requestSabrRootPlayback(player?.el ?? null, paused))) return;
    if (paused) await remote.play();
    else await remote.pause();
  };

  return (
    <button
      type="button"
      className="typetype-audio-play-button"
      aria-label={label}
      title={label}
      onClick={() => void togglePlayback().catch(() => {})}
    >
      <Icon size={32} />
    </button>
  );
}
