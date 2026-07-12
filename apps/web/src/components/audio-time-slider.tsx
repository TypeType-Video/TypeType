import { secondsFromSliderPercent } from "../lib/sabr-player-seek";
import { requestSabrSeek } from "../lib/sabr-vidstack-bridge";
import { TimeSlider } from "../lib/vidstack";

type Props = {
  disabled?: boolean;
  video?: HTMLVideoElement | null;
};

export function AudioTimeSlider({ disabled = false, video = null }: Props) {
  return (
    <TimeSlider.Root
      className="typetype-audio-time-slider"
      disabled={disabled}
      aria-busy={disabled}
      data-seeking={disabled ? "true" : undefined}
      onDragEnd={(percent) => {
        const seconds = video ? secondsFromSliderPercent(video.duration, percent) : null;
        if (video && !disabled && seconds !== null) requestSabrSeek(video, seconds);
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
