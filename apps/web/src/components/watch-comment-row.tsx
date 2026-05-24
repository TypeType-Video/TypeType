import type { Comment } from "../types/comment";
import { WatchComment } from "./watch-comment";

type Props = {
  comment: Comment;
  videoUrl: string;
  index: number;
  onSeekTimestamp?: (seconds: number) => void;
};

export function WatchCommentRow({ comment, videoUrl, index, onSeekTimestamp }: Props) {
  return (
    <div
      className="animate-card-pop-in"
      style={{
        animationDelay: `${Math.min(index * 35, 210)}ms`,
        contentVisibility: "auto",
        containIntrinsicSize: "160px",
      }}
    >
      <WatchComment comment={comment} videoUrl={videoUrl} onSeekTimestamp={onSeekTimestamp} />
    </div>
  );
}
