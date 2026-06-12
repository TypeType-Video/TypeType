import type { VideoStream } from "../types/stream";
import { RelatedVideos } from "./related-videos";
import { WatchMeta } from "./watch-meta";

type Props = {
  cinemaMode: boolean;
  stream: VideoStream;
  relatedStreams: VideoStream[];
  showComments: boolean;
  onSeekTimestamp: (seconds: number) => void;
};

export function WatchSecondaryContent({
  cinemaMode,
  stream,
  relatedStreams,
  showComments,
  onSeekTimestamp,
}: Props) {
  if (!cinemaMode) {
    return (
      <div className="w-full lg:flex-1 lg:min-w-64 flex flex-col gap-6">
        <RelatedVideos streams={relatedStreams} />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[1700px] flex-col gap-6 px-4 lg:flex-row lg:items-start">
      <div className="min-w-0 flex-[2] max-w-[1200px] flex flex-col gap-4">
        <WatchMeta stream={stream} showComments={showComments} onSeekTimestamp={onSeekTimestamp} />
      </div>
      <div className="w-full lg:flex-1 lg:min-w-64">
        <RelatedVideos streams={relatedStreams} />
      </div>
    </div>
  );
}
