export function isVideoWatched(progress: number, duration: number): boolean {
  if (!Number.isFinite(progress) || !Number.isFinite(duration)) return false;
  if (progress <= 0 || duration <= 0) return false;
  const boundedProgress = Math.min(progress, duration);
  if (duration > 60) return boundedProgress >= duration - 60;
  return boundedProgress >= duration * 0.9;
}

export function isVideoInProgress(progress: number, duration: number): boolean {
  return progress > 0 && duration > 0 && !isVideoWatched(progress, duration);
}
