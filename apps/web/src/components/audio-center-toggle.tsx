import { requestSabrVidstackPlayback } from "../lib/sabr-vidstack-bridge";
import { useMediaRemote, useMediaState } from "../lib/vidstack";

export function AudioCenterToggle({ video = null }: { video?: HTMLVideoElement | null }) {
  const remote = useMediaRemote();
  const paused = useMediaState("paused");
  const label = paused ? "Play audio" : "Pause audio";

  const togglePlayback = async () => {
    if (video) return requestSabrVidstackPlayback(video, paused, true);
    if (paused) await remote.play();
    else await remote.pause();
  };

  return (
    <button
      type="button"
      className="typetype-audio-center-toggle"
      aria-label={label}
      onClickCapture={(event) => {
        event.stopPropagation();
        void togglePlayback().catch(() => {});
      }}
    />
  );
}
