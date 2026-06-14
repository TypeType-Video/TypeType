import { formatLikes } from "../lib/format";
import type { VideoStream } from "../types/stream";
import { ThumbsDownIcon, ThumbsUpIcon } from "./watch-icons";

type Props = {
  stream: VideoStream;
};

export function WatchLikeDislike({ stream }: Props) {
  const hasLikes = typeof stream.likes === "number" && stream.likes >= 0;
  const hasDislikes = typeof stream.dislikes === "number" && stream.dislikes >= 0;
  if (!hasLikes && !hasDislikes) return null;

  return (
    <div className="flex items-center gap-3 text-sm text-fg-muted">
      {hasLikes && (
        <span className="flex items-center gap-1.5">
          <ThumbsUpIcon />
          {formatLikes(stream.likes ?? 0)}
        </span>
      )}
      {hasDislikes && (
        <span className="flex items-center gap-1.5">
          <ThumbsDownIcon />
          {formatLikes(stream.dislikes ?? 0)}
        </span>
      )}
    </div>
  );
}
