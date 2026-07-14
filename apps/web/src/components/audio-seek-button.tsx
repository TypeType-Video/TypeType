import { requestSabrSeek } from "../lib/sabr-vidstack-bridge";
import { useMediaRemote, useMediaState } from "../lib/vidstack";
import { AudioSeekBackward10Icon, AudioSeekForward10Icon } from "./audio-control-icons";

type Props = {
  direction: "backward" | "forward";
  disabled?: boolean;
  video?: HTMLVideoElement | null;
};

export function AudioSeekButton({ direction, disabled = false, video = null }: Props) {
  const remote = useMediaRemote();
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");
  const seconds = direction === "backward" ? -10 : 10;
  const label = direction === "backward" ? "Seek backward 10 seconds" : "Seek forward 10 seconds";
  const Icon = direction === "backward" ? AudioSeekBackward10Icon : AudioSeekForward10Icon;

  const seek = () => {
    const target = currentTime + seconds;
    const bounded = Math.min(Math.max(target, 0), duration > 0 ? duration : target);
    if (video && requestSabrSeek(video, bounded)) return;
    remote.seek(bounded);
  };

  return (
    <button
      type="button"
      className={`typetype-audio-seek-button typetype-audio-seek-button-${direction}`}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={seek}
    >
      <Icon size={32} />
    </button>
  );
}
