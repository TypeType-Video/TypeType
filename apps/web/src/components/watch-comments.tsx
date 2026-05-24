import { useCallback, useMemo, useState } from "react";
import { useInfiniteComments } from "../hooks/use-infinite-comments";
import { WatchCommentSkeleton } from "./watch-comment-skeleton";
import { WatchCommentsLazyList } from "./watch-comments-lazy-list";

const SKELETON_KEYS = Array.from({ length: 5 }, (_, i) => `cs-${i}`);
const INITIAL_RENDER_COUNT = 4;
const RENDER_STEP = 4;

type Props = {
  videoUrl: string;
  onSeekTimestamp?: (seconds: number) => void;
};

export function WatchComments({ videoUrl, onSeekTimestamp }: Props) {
  const { data, isFetchingNextPage, hasNextPage, fetchNextPage, isLoading } =
    useInfiniteComments(videoUrl);
  const [renderCount, setRenderCount] = useState(INITIAL_RENDER_COUNT);

  const commentsDisabled = data?.pages[0]?.commentsDisabled ?? false;
  const allComments = data?.pages.flatMap((p) => p.comments) ?? [];
  const comments = allComments.filter(
    (c) => (c.text as string | null) && (c.author as string | null),
  );
  const visibleComments = useMemo(() => comments.slice(0, renderCount), [comments, renderCount]);
  const hasHiddenComments = visibleComments.length < comments.length;
  const loadMore = useCallback(() => {
    if (hasHiddenComments) {
      setRenderCount((count) => Math.min(count + RENDER_STEP, comments.length));
      return;
    }
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasHiddenComments, comments.length, hasNextPage, isFetchingNextPage, fetchNextPage]);
  const showSkeletons = isLoading || isFetchingNextPage;
  const canLoadMore = hasHiddenComments || !!hasNextPage;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-base font-semibold text-fg">Comments</h2>
      {commentsDisabled ? (
        <p className="text-sm text-fg-soft">Comments are disabled for this video.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <WatchCommentsLazyList
            comments={visibleComments}
            videoUrl={videoUrl}
            onSeekTimestamp={onSeekTimestamp}
          />
          {showSkeletons && SKELETON_KEYS.map((k) => <WatchCommentSkeleton key={k} />)}
          {canLoadMore && !isLoading && (
            <button
              type="button"
              onClick={loadMore}
              disabled={isFetchingNextPage}
              className="w-fit rounded-md border border-border-strong bg-surface px-3 py-1.5 text-xs text-fg-muted transition-colors hover:bg-surface-strong hover:text-fg disabled:cursor-not-allowed disabled:text-fg-soft"
            >
              {isFetchingNextPage ? "Loading..." : "Load more comments"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
