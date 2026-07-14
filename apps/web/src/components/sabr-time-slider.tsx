import { useEffect, useState } from "react";
import { secondsFromSliderPercent } from "../lib/sabr-player-seek";
import { requestSabrSeek } from "../lib/sabr-vidstack-bridge";
import { TimeSlider } from "../lib/vidstack";

type Props = {
  disabled?: boolean;
  thumbnails?: string;
  video: HTMLVideoElement | null;
};

export function SabrTimeSlider({ disabled = false, thumbnails, video }: Props) {
  const [seekTarget, setSeekTarget] = useState<number | null>(null);
  useEffect(() => {
    if (!disabled) setSeekTarget(null);
  }, [disabled]);
  const style = seekTarget === null ? undefined : { "--typetype-seek-target": `${seekTarget}%` };

  return (
    <TimeSlider.Root
      className="vds-time-slider vds-slider"
      style={style}
      aria-label="Seek"
      aria-busy={disabled}
      data-seeking={disabled ? "true" : undefined}
      disabled={disabled}
      onDragEnd={(percent) => {
        setSeekTarget(percent);
        const seconds = video ? secondsFromSliderPercent(video.duration, percent) : null;
        if (video && !disabled && seconds !== null) requestSabrSeek(video, seconds);
      }}
    >
      <TimeSlider.Track className="vds-slider-track" />
      <TimeSlider.TrackFill className="vds-slider-track-fill vds-slider-track" />
      <TimeSlider.Progress className="vds-slider-progress vds-slider-track" />
      <TimeSlider.Thumb className="vds-slider-thumb" />
      <TimeSlider.Preview className="vds-slider-preview">
        {thumbnails && (
          <TimeSlider.Thumbnail.Root
            src={thumbnails}
            className="vds-slider-thumbnail vds-thumbnail"
          >
            <TimeSlider.Thumbnail.Img />
          </TimeSlider.Thumbnail.Root>
        )}
        <TimeSlider.Value className="vds-slider-value" />
      </TimeSlider.Preview>
    </TimeSlider.Root>
  );
}
