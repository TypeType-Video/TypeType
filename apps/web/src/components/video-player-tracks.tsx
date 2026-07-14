import { Track } from "../lib/vidstack";
import type { SubtitleItem } from "../types/api";
import { buildSafeSubtitleTracks } from "./subtitle-track-utils";
import { ChaptersTrack } from "./video-player-core";

type Props = {
  subtitles?: SubtitleItem[];
  chaptersVtt?: string;
};

export function VideoPlayerTracks({ subtitles, chaptersVtt }: Props) {
  const subtitleTracks = buildSafeSubtitleTracks(subtitles);
  return (
    <>
      {subtitleTracks.map((track) => (
        <Track
          key={track.key}
          id={track.id}
          kind="subtitles"
          src={track.src}
          label={track.label}
          lang={track.lang}
          type="vtt"
        />
      ))}
      {chaptersVtt && <ChaptersTrack src={chaptersVtt} />}
    </>
  );
}
