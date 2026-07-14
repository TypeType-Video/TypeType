import { useMemo } from "react";
import type { VideoStream } from "../types/stream";
import { VideoCard } from "./video-card";

type VideoGridProps = {
  streams: VideoStream[];
  onCardOpen?: (stream: VideoStream) => void;
  onCardImpression?: (stream: VideoStream) => void;
  listId?: string;
};

export function VideoGrid({ streams, onCardOpen, onCardImpression, listId }: VideoGridProps) {
  const unique = useMemo(() => {
    const seen = new Set<string>();
    const result: VideoStream[] = [];
    for (const stream of streams) {
      if (seen.has(stream.id)) continue;
      seen.add(stream.id);
      result.push(stream);
    }
    return result;
  }, [streams]);
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {unique.map((stream, index) => (
        <div
          key={stream.id}
          className="animate-card-pop-in"
          style={{ animationDelay: `${Math.min(index * 45, 270)}ms` }}
        >
          <VideoCard
            stream={stream}
            onOpen={onCardOpen ? () => onCardOpen(stream) : undefined}
            onImpression={onCardImpression ? () => onCardImpression(stream) : undefined}
            listId={listId}
            relatedStreams={unique}
          />
        </div>
      ))}
    </div>
  );
}
