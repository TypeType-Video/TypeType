export const SPONSORBLOCK_SKIP_EVENT = "typetype-sponsorblock-skip";

export type SponsorBlockSkipNoticeDetail = {
  category: string;
  automatic: boolean;
  toEnd: boolean;
};

declare global {
  interface WindowEventMap {
    "typetype-sponsorblock-skip": CustomEvent<SponsorBlockSkipNoticeDetail>;
  }
}

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

export function emitSponsorBlockSkip(detail: SponsorBlockSkipNoticeDetail) {
  window.dispatchEvent(new CustomEvent(SPONSORBLOCK_SKIP_EVENT, { detail }));
}
