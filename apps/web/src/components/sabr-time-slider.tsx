import { requestSabrSeek } from "../lib/sabr-vidstack-bridge";
import { TimeSlider } from "../lib/vidstack";

type Props = {
  disabled?: boolean;
  video: HTMLVideoElement | null;
};

export function SabrTimeSlider({ disabled = false, video }: Props) {
  return (
    <TimeSlider.Root
      className="vds-time-slider vds-slider"
      aria-label="Seek"
      aria-busy={disabled}
      data-seeking={disabled ? "true" : undefined}
      disabled={disabled}
      onDragEnd={(seconds) => {
        if (video && !disabled) requestSabrSeek(video, seconds);
      }}
    >
      <TimeSlider.Track className="vds-slider-track" />
      <TimeSlider.TrackFill className="vds-slider-track-fill vds-slider-track" />
      <TimeSlider.Progress className="vds-slider-progress vds-slider-track" />
      <TimeSlider.Thumb className="vds-slider-thumb" />
      <TimeSlider.Preview className="vds-slider-preview">
        <TimeSlider.Value className="vds-slider-value" />
      </TimeSlider.Preview>
    </TimeSlider.Root>
  );
}
