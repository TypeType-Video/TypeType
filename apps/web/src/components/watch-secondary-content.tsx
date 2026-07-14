import type { ReactNode } from "react";
import type { WatchAudioOnlyControls } from "../hooks/use-watch-audio-only-playback";
import type { VideoStream } from "../types/stream";
import { RelatedVideos } from "./related-videos";
import { WatchMeta } from "./watch-meta";

type Props = {
  cinemaMode: boolean;
  stream: VideoStream;
  relatedStreams: VideoStream[];
  showComments: boolean;
  playlistPanel?: ReactNode;
  onSeekTimestamp: (seconds: number) => void;
  audioOnly: WatchAudioOnlyControls;
};

export function WatchSecondaryContent({
  cinemaMode,
  stream,
  relatedStreams,
  showComments,
  playlistPanel,
  onSeekTimestamp,
  audioOnly,
}: Props) {
  const hasPlaylistPanel = Boolean(playlistPanel);
  const hasRelatedStreams = relatedStreams.length > 0;

  if (!cinemaMode) {
    if (!(hasPlaylistPanel || hasRelatedStreams)) return null;

    return (
      <div className="w-full lg:flex-1 lg:min-w-64 flex flex-col gap-6">
        {playlistPanel}
        {hasRelatedStreams && <RelatedVideos streams={relatedStreams} />}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 px-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-[2] max-w-[1200px] flex flex-col gap-4">
        <WatchMeta
          stream={stream}
          showComments={showComments}
          onSeekTimestamp={onSeekTimestamp}
          audioOnly={audioOnly}
        />
      </div>
      {(hasPlaylistPanel || hasRelatedStreams) && (
        <div className="w-full lg:flex-1 lg:min-w-64 flex flex-col gap-6">
          {playlistPanel}
          {hasRelatedStreams && <RelatedVideos streams={relatedStreams} />}
        </div>
      )}
    </div>
  );
}
