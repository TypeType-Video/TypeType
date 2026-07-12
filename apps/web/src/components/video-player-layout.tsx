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
import { SabrTimeSlider } from "./sabr-time-slider";

type Props = {
  audioOnly?: boolean;
  audioUsesVideoProvider?: boolean;
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
  audioUsesVideoProvider = false,
  sabr = false,
  sabrVideo = null,
  seeking = false,
  thumbnailVtt,
  originalAudioLocale,
  onPreviousVideo,
  onNextVideo,
}: Props) {
  if (audioOnly) {
    const slots = {
      captionButton: null,
      endTime: (
        <div className="typetype-audio-time-pair">
          <Time type="current" />
          <span>/</span>
          <Time type="duration" />
        </div>
      ),
      timeSlider: <AudioTimeSlider disabled={seeking} video={sabrVideo} />,
      seekBackwardButton: (
        <AudioSeekButton direction="backward" disabled={seeking} video={sabrVideo} />
      ),
      playButton: <AudioPlayButton video={sabrVideo} />,
      seekForwardButton: (
        <AudioSeekButton direction="forward" disabled={seeking} video={sabrVideo} />
      ),
      beforeCaptionButton: <PlayerTrackButton direction="previous" onClick={onPreviousVideo} />,
      afterCaptionButton: <PlayerTrackButton direction="next" onClick={onNextVideo} />,
      beforeSettingsMenu: <PlayerVolumeControl />,
    };
    if (audioUsesVideoProvider) {
      return (
        <DefaultVideoLayout
          className="typetype-adaptive-audio-layout"
          icons={defaultLayoutIcons}
          smallLayoutWhen={false}
          translations={{ Captions: "Subtitles" }}
          slots={{
            ...slots,
            fullscreenButton: null,
            pipButton: null,
            title: null,
            chapterTitle: null,
          }}
        />
      );
    }
    return (
      <DefaultAudioLayout
        icons={defaultLayoutIcons}
        smallLayoutWhen={false}
        translations={{ Captions: "Subtitles" }}
        slots={slots}
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
        timeSlider: sabr ? (
          <SabrTimeSlider disabled={seeking} thumbnails={thumbnailVtt} video={sabrVideo} />
        ) : undefined,
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
