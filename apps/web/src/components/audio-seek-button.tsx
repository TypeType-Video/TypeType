import { useMediaRemote, useMediaState } from "../lib/vidstack";
import { AudioSeekBackward10Icon, AudioSeekForward10Icon } from "./audio-control-icons";

type Props = {
  direction: "backward" | "forward";
  disabled?: boolean;
};

export function AudioSeekButton({ direction, disabled = false }: Props) {
  const remote = useMediaRemote();
  const currentTime = useMediaState("currentTime");
  const duration = useMediaState("duration");
  const seconds = direction === "backward" ? -10 : 10;
  const label = direction === "backward" ? "Seek backward 10 seconds" : "Seek forward 10 seconds";
  const Icon = direction === "backward" ? AudioSeekBackward10Icon : AudioSeekForward10Icon;

  const seek = () => {
    const target = currentTime + seconds;
    remote.seek(Math.min(Math.max(target, 0), duration > 0 ? duration : target));
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
