import { DefaultVideoLayout, defaultLayoutIcons } from "../lib/vidstack";
import { AudioTrackSelector } from "./audio-track-selector";
import { CinemaModeControl } from "./cinema-mode-control";
import { FormatSelector } from "./format-selector";
import { PlayerTrackButton } from "./player-track-button";
import { QualitySelector } from "./quality-selector";

type Props = {
  thumbnailVtt?: string;
  originalAudioLocale?: string | null;
  onPreviousVideo?: () => void;
  onNextVideo?: () => void;
};

export function VideoPlayerLayout({
  thumbnailVtt,
  originalAudioLocale,
  onPreviousVideo,
  onNextVideo,
}: Props) {
  return (
    <DefaultVideoLayout
      icons={defaultLayoutIcons}
      thumbnails={thumbnailVtt}
      smallLayoutWhen={false}
      translations={{ Captions: "Subtitles" }}
      slots={{
        settingsMenuItemsStart: (
          <>
            <AudioTrackSelector originalLocale={originalAudioLocale} />
            <QualitySelector />
            <FormatSelector />
          </>
        ),
        beforePlayButton: <PlayerTrackButton direction="previous" onClick={onPreviousVideo} />,
        afterPlayButton: <PlayerTrackButton direction="next" onClick={onNextVideo} />,
        beforeFullscreenButton: <CinemaModeControl />,
      }}
    />
  );
}
