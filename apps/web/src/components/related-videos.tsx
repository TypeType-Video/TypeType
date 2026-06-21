import { useMemo } from "react";
import { useBlockedFilter } from "../hooks/use-blocked-filter";
import type { VideoStream } from "../types/stream";
import { AutoplayToggle } from "./autoplay-toggle";
import { RelatedCard } from "./related-card";
import { RelatedCardSkeleton } from "./related-card-skeleton";

const SKELETON_KEYS = Array.from({ length: 4 }, (_, i) => `rs-${i}`);

type Props = {
  streams: VideoStream[];
  isLoading?: boolean;
};

function uniqueStreams(streams: VideoStream[]): VideoStream[] {
  const seen = new Set<string>();
  const unique: VideoStream[] = [];
  for (const stream of streams) {
    if (seen.has(stream.id)) continue;
    seen.add(stream.id);
    unique.push(stream);
  }
  return unique;
}

export function RelatedVideos({ streams, isLoading = false }: Props) {
  const { filter } = useBlockedFilter();
  const visible = useMemo(() => uniqueStreams(filter(streams)), [filter, streams]);
  return (
    <div className="flex flex-col gap-3">
      <AutoplayToggle />
      {isLoading
        ? SKELETON_KEYS.map((k) => <RelatedCardSkeleton key={k} />)
        : visible.map((stream, index) => (
            <div
              key={stream.id}
              className="animate-card-pop-in"
              style={{ animationDelay: `${Math.min(index * 35, 210)}ms` }}
            >
              <RelatedCard stream={stream} />
            </div>
          ))}
    </div>
  );
}
