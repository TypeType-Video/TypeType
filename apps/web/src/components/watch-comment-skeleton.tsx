export function WatchCommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="w-8 h-8 rounded-full bg-fg/10 flex-shrink-0 mt-0.5" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex gap-2">
          <div className="h-3 bg-fg/10 rounded w-24" />
          <div className="h-3 bg-fg/10 rounded w-12" />
        </div>
        <div className="h-4 bg-fg/10 rounded w-full" />
        <div className="h-4 bg-fg/10 rounded w-4/5" />
        <div className="h-3 bg-fg/10 rounded w-16" />
      </div>
    </div>
  );
}
