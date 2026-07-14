import { useEffect, useState } from "react";
import { secondsFromSliderPercent } from "../lib/sabr-player-seek";
import { requestSabrSeek } from "../lib/sabr-vidstack-bridge";
import { TimeSlider, useMediaRemote, useMediaState } from "../lib/vidstack";

type Props = {
  disabled?: boolean;
  video?: HTMLVideoElement | null;
};

export function AudioTimeSlider({ disabled = false, video = null }: Props) {
  const [seekTarget, setSeekTarget] = useState<number | null>(null);
  const remote = useMediaRemote();
  const mediaDuration = useMediaState("duration");
  useEffect(() => {
    if (!disabled) setSeekTarget(null);
  }, [disabled]);
  const style = seekTarget === null ? undefined : { "--typetype-seek-target": `${seekTarget}%` };

  return (
    <TimeSlider.Root
      className="typetype-audio-time-slider"
      style={style}
      disabled={disabled}
      aria-busy={disabled}
      data-seeking={disabled ? "true" : undefined}
      onDragEnd={(percent) => {
        setSeekTarget(percent);
        const seconds = secondsFromSliderPercent(video?.duration ?? mediaDuration, percent);
        if (disabled || seconds === null) return;
        if (video && requestSabrSeek(video, seconds)) return;
        remote.seek(seconds);
      }}
    >
      <TimeSlider.Track className="typetype-audio-time-slider-track">
        <TimeSlider.Progress className="typetype-audio-time-slider-progress" />
        <TimeSlider.TrackFill className="typetype-audio-time-slider-fill" />
      </TimeSlider.Track>
      <TimeSlider.Thumb className="typetype-audio-time-slider-thumb" />
    </TimeSlider.Root>
  );
}
