import { DefaultAudioLayout, DefaultVideoLayout, defaultLayoutIcons, Time } from "../lib/vidstack";
import { AudioPlayButton } from "./audio-play-button";
import { AudioSeekButton } from "./audio-seek-button";
import { AudioTimeSlider } from "./audio-time-slider";
import { AudioTrackSelector } from "./audio-track-selector";
import { CinemaModeControl } from "./cinema-mode-control";
import { FormatSelector } from "./format-selector";
import { PlayerTrackButton } from "./player-track-button";
import { PlayerVolumeControl } from "./player-volume-control";
import { QualitySelector } from "./quality-selector";

type Props = {
  audioOnly?: boolean;
  sabr?: boolean;
  sabrVideo?: HTMLVideoElement | null;
  seeking?: boolean;
  thumbnailVtt?: string;
  originalAudioLocale?: string | null;
  onPreviousVideo?: () => void;
  onNextVideo?: () => void;
};

export function VideoPlayerLayout({
  audioOnly = false,
  sabr = false,
  sabrVideo = null,
  seeking = false,
  thumbnailVtt,
  originalAudioLocale,
  onPreviousVideo,
  onNextVideo,
}: Props) {
  if (audioOnly) {
    return (
      <DefaultAudioLayout
        icons={defaultLayoutIcons}
        smallLayoutWhen={false}
        translations={{ Captions: "Subtitles" }}
        slots={{
          captionButton: null,
          endTime: (
            <div className="typetype-audio-time-pair">
              <Time type="current" />
              <span>/</span>
              <Time type="duration" />
            </div>
          ),
          timeSlider: <AudioTimeSlider disabled={seeking} />,
          seekBackwardButton: <AudioSeekButton direction="backward" disabled={seeking} />,
          playButton: <AudioPlayButton video={sabrVideo} />,
          seekForwardButton: <AudioSeekButton direction="forward" disabled={seeking} />,
          beforeCaptionButton: <PlayerTrackButton direction="previous" onClick={onPreviousVideo} />,
          afterCaptionButton: <PlayerTrackButton direction="next" onClick={onNextVideo} />,
          beforeSettingsMenu: <PlayerVolumeControl />,
        }}
      />
    );
  }

  return (
    <DefaultVideoLayout
      icons={defaultLayoutIcons}
      thumbnails={thumbnailVtt}
      smallLayoutWhen={false}
      translations={{ Captions: "Subtitles" }}
      slots={{
        settingsMenuItemsStart: (
          <>
            <AudioTrackSelector originalLocale={originalAudioLocale} sabr={sabr} />
            <QualitySelector />
            <FormatSelector />
          </>
        ),
        beforePlayButton: <PlayerTrackButton direction="previous" onClick={onPreviousVideo} />,
        afterPlayButton: <PlayerTrackButton direction="next" onClick={onNextVideo} />,
        beforeFullscreenButton: (
          <>
            <PlayerVolumeControl />
            <CinemaModeControl />
          </>
        ),
      }}
    />
  );
}
