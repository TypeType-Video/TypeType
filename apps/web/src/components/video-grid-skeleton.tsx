import { VideoCardSkeleton } from "./video-card-skeleton";

const DEFAULT_COUNT = 12;

type Props = {
  count?: number;
  idPrefix?: string;
};

export function VideoGridSkeleton({ count = DEFAULT_COUNT, idPrefix = "video-grid" }: Props) {
  const keys = Array.from({ length: count }, (_, index) => `${idPrefix}-${index}`);
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 sm:gap-y-8 md:grid-cols-3 lg:grid-cols-4">
      {keys.map((key) => (
        <VideoCardSkeleton key={key} />
      ))}
    </div>
  );
}
