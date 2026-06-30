import { useEffect, useRef, useState } from "react";
import { getSponsorBlockCategoryLabel } from "../lib/sponsorblock-settings";
import {
  SPONSORBLOCK_SKIP_EVENT,
  type SponsorBlockSkipNoticeDetail,
} from "../lib/sponsorblock-skip";

type Notice = SponsorBlockSkipNoticeDetail & {
  id: number;
};

export function SponsorBlockSkipNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimer = () => {
      if (!timerRef.current) return;
      clearTimeout(timerRef.current);
      timerRef.current = null;
    };
    const show = (event: WindowEventMap[typeof SPONSORBLOCK_SKIP_EVENT]) => {
      clearTimer();
      setNotice({ ...event.detail, id: Date.now() });
      timerRef.current = setTimeout(() => setNotice(null), 2600);
    };
    window.addEventListener(SPONSORBLOCK_SKIP_EVENT, show);
    return () => {
      clearTimer();
      window.removeEventListener(SPONSORBLOCK_SKIP_EVENT, show);
    };
  }, []);

  if (!notice) return null;

  const label = getSponsorBlockCategoryLabel(notice.category);
  const action = notice.automatic ? "Skipped automatically" : "Skipped";

  return (
    <div className="absolute right-3 top-3 z-50 max-w-[min(22rem,calc(100%-1.5rem))] rounded-xl border border-white/15 bg-black/78 px-3 py-2 text-xs text-white shadow-lg backdrop-blur sm:right-4 sm:top-4 sm:rounded-full">
      <div className="font-medium leading-tight">{action}</div>
      <div className="text-[11px] leading-tight text-white/62">
        {label}
        {notice.toEnd ? " · ending video" : ""}
      </div>
    </div>
  );
}
