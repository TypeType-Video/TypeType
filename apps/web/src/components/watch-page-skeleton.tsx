import type { VideoStream } from "../types/stream";
import { PageSpinner } from "./page-spinner";
import { RelatedCardSkeleton } from "./related-card-skeleton";
import { RelatedVideos } from "./related-videos";
import { WatchCommentSkeleton } from "./watch-comment-skeleton";
import { WatchComments } from "./watch-comments";
import { WatchInfo } from "./watch-info";

const RELATED_KEYS = ["related-1", "related-2", "related-3", "related-4", "related-5"];
const COMMENT_KEYS = ["comment-1", "comment-2", "comment-3"];

type Props = {
  stream?: VideoStream;
  relatedStreams?: VideoStream[];
  videoUrl?: string;
  showComments?: boolean;
};

export function WatchPageSkeleton({
  stream,
  relatedStreams = [],
  videoUrl,
  showComments = true,
}: Props) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start [animation:page-fade-in_0.2s_ease-out]">
      <div className="flex min-w-0 flex-[2] flex-col gap-5 lg:max-w-[133.333vh]">
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
          <PageSpinner fullScreen={false} />
        </div>
        {stream ? (
          <WatchInfo stream={stream} />
        ) : (
          <div className="flex animate-pulse flex-col gap-4">
            <div className="h-6 w-3/4 rounded bg-fg/10" />
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-fg/10" />
              <div className="flex flex-1 flex-col gap-2">
                <div className="h-4 w-36 rounded bg-fg/10" />
                <div className="h-3 w-24 rounded bg-fg/10" />
              </div>
              <div className="h-9 w-24 rounded bg-fg/10" />
            </div>
            <div className="h-20 w-full rounded bg-fg/10" />
          </div>
        )}
        {showComments &&
          (videoUrl ? (
            <WatchComments videoUrl={videoUrl} />
          ) : (
            <div className="flex flex-col gap-5 pt-2">
              {COMMENT_KEYS.map((key) => (
                <WatchCommentSkeleton key={key} />
              ))}
            </div>
          ))}
      </div>
      <aside className="flex w-full flex-col gap-3 lg:min-w-64 lg:flex-1">
        {relatedStreams.length > 0 ? (
          <RelatedVideos streams={relatedStreams} />
        ) : (
          RELATED_KEYS.map((key) => <RelatedCardSkeleton key={key} />)
        )}
      </aside>
    </div>
  );
}
