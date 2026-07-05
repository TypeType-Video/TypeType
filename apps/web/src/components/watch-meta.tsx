import type { WatchAudioOnlyControls } from "../hooks/use-watch-audio-only-playback";
import type { VideoStream } from "../types/stream";
import { WatchActions } from "./watch-actions";
import { WatchComments } from "./watch-comments";
import { WatchDescription } from "./watch-description";
import { WatchInfo } from "./watch-info";

type Props = {
  stream: VideoStream;
  showComments?: boolean;
  onSeekTimestamp?: (seconds: number) => void;
  audioOnly: WatchAudioOnlyControls;
};

export function WatchMeta({ stream, showComments = true, onSeekTimestamp, audioOnly }: Props) {
  return (
    <>
      <WatchInfo stream={stream} />
      <WatchActions stream={stream} audioOnly={audioOnly} />
      {stream.description && (
        <WatchDescription
          description={stream.description}
          uploadedAt={stream.publishedAt}
          onSeekTimestamp={onSeekTimestamp}
        />
      )}
      {showComments && (
        <WatchComments key={stream.id} videoUrl={stream.id} onSeekTimestamp={onSeekTimestamp} />
      )}
    </>
  );
}
