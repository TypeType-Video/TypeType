import { defaultLayoutIcons, MuteButton, useMediaState, VolumeSlider } from "../lib/vidstack";

export function PlayerVolumeControl() {
  const muted = useMediaState("muted");
  const volume = useMediaState("volume");
  const canSetVolume = useMediaState("canSetVolume");
  const Icon =
    muted || volume === 0
      ? defaultLayoutIcons.MuteButton.Mute
      : volume < 0.5
        ? defaultLayoutIcons.MuteButton.VolumeLow
        : defaultLayoutIcons.MuteButton.VolumeHigh;

  return (
    <div className="typetype-mobile-volume-control">
      <MuteButton className="typetype-mobile-volume-mute" aria-label={muted ? "Unmute" : "Mute"}>
        <Icon />
      </MuteButton>
      {canSetVolume ? (
        <VolumeSlider.Root className="typetype-mobile-volume-slider">
          <VolumeSlider.Track className="typetype-mobile-volume-track">
            <VolumeSlider.TrackFill className="typetype-mobile-volume-fill" />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb className="typetype-mobile-volume-thumb" />
        </VolumeSlider.Root>
      ) : null}
    </div>
  );
}
