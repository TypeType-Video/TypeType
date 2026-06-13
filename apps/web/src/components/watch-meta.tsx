import type { VideoStream } from "../types/stream";
import { WatchActions } from "./watch-actions";
import { WatchComments } from "./watch-comments";
import { WatchDescription } from "./watch-description";
import { WatchInfo } from "./watch-info";

type Props = {
  stream: VideoStream;
  showComments?: boolean;
  currentPositionRef?: { current: number };
  onSeekTimestamp?: (seconds: number) => void;
};

export function WatchMeta({
  stream,
  showComments = true,
  currentPositionRef,
  onSeekTimestamp,
}: Props) {
  return (
    <>
      <WatchInfo stream={stream} />
      <WatchActions stream={stream} currentPositionRef={currentPositionRef} />
      {stream.description && (
        <WatchDescription description={stream.description} onSeekTimestamp={onSeekTimestamp} />
      )}
      {showComments && (
        <WatchComments key={stream.id} videoUrl={stream.id} onSeekTimestamp={onSeekTimestamp} />
      )}
    </>
  );
}
