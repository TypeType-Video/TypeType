import { TimeSlider } from "../lib/vidstack";

type Props = {
  disabled?: boolean;
};

export function AudioTimeSlider({ disabled = false }: Props) {
  return (
    <TimeSlider.Root
      className="typetype-audio-time-slider"
      disabled={disabled}
      aria-busy={disabled}
      data-seeking={disabled ? "true" : undefined}
    >
      <TimeSlider.Track className="typetype-audio-time-slider-track">
        <TimeSlider.Progress className="typetype-audio-time-slider-progress" />
        <TimeSlider.TrackFill className="typetype-audio-time-slider-fill" />
      </TimeSlider.Track>
      <TimeSlider.Thumb className="typetype-audio-time-slider-thumb" />
    </TimeSlider.Root>
  );
}
