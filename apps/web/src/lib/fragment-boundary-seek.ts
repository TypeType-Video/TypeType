export function snapToFragmentBoundary(seconds: number, intervalSeconds: number): number {
  if (!Number.isFinite(seconds) || !Number.isFinite(intervalSeconds) || intervalSeconds <= 0) {
    return seconds;
  }
  const boundary = Math.max(0, Math.round(seconds / intervalSeconds) * intervalSeconds);
  return boundary === 0 ? 0 : boundary + 0.05;
}
