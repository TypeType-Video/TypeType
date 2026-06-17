export function RelatedCardSkeleton() {
  return (
    <div className="flex gap-2 animate-pulse">
      <div className="w-40 aspect-video rounded-md bg-fg/10 flex-shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="h-3 bg-fg/10 rounded w-full" />
        <div className="h-3 bg-fg/10 rounded w-3/4" />
        <div className="h-3 bg-fg/10 rounded w-1/3" />
      </div>
    </div>
  );
}
