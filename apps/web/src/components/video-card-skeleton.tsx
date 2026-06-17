export function VideoCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-fg/10 rounded-xl mb-3" />
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-fg/10 shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-fg/10 rounded w-full" />
          <div className="h-4 bg-fg/10 rounded w-3/4" />
          <div className="h-3 bg-fg/10 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}
