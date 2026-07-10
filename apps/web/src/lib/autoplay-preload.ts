const AUTOPLAY_PRELOAD_WINDOW_MS = 45_000;

export function shouldPreloadAutoplayTarget(
  positionMs: number,
  durationMs: number,
  enabled: boolean,
  hasTarget: boolean,
): boolean {
  if (!enabled || !hasTarget || positionMs <= 0 || durationMs <= 0) return false;
  return durationMs - positionMs <= AUTOPLAY_PRELOAD_WINDOW_MS;
}
