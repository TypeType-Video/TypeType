const END_SKIP_THRESHOLD_SECONDS = 0.75;
const END_SKIP_TARGET_OFFSET_SECONDS = 0.35;

export function isSponsorBlockEndSkip(endTime: number, duration: number) {
  return duration > 0 && endTime >= duration - END_SKIP_THRESHOLD_SECONDS;
}

export function sponsorBlockSkipTarget(endTime: number, duration: number) {
  if (isSponsorBlockEndSkip(endTime, duration)) {
    return Math.max(0, duration - END_SKIP_TARGET_OFFSET_SECONDS);
  }
  return Math.max(0, endTime);
}
