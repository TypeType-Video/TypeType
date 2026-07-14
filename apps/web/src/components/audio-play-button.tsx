import { requestSabrVidstackPlayback } from "../lib/sabr-vidstack-bridge";
import { useMediaRemote, useMediaState } from "../lib/vidstack";
import { AudioPauseIcon, AudioPlayIcon } from "./audio-control-icons";

export function AudioPlayButton({ video = null }: { video?: HTMLVideoElement | null }) {
  const remote = useMediaRemote();
  const paused = useMediaState("paused");
  const Icon = paused ? AudioPlayIcon : AudioPauseIcon;
  const label = paused ? "Play" : "Pause";

  const togglePlayback = async () => {
    if (video) return requestSabrVidstackPlayback(video, paused, true);
    if (paused) await remote.play();
    else await remote.pause();
  };

  return (
    <button
      type="button"
      className="typetype-audio-play-button"
      aria-label={label}
      title={label}
      onClickCapture={(event) => {
        event.stopPropagation();
        void togglePlayback().catch(() => {});
      }}
    >
      <Icon size={32} />
    </button>
  );
}
