import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

type Props = {
  onRetry: () => void;
};

export function PlayerError({ onRetry }: Props) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-app flex flex-col items-center justify-center gap-5 z-50">
      <img src="/sad-sigh.gif" width="220" height="220" alt="" className="rounded-2xl" />
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-white text-base font-semibold tracking-tight">Playback failed</p>
        <p className="text-fg-muted text-sm max-w-xs text-center">
          This video could not be played. The stream may be unavailable or unsupported.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2 rounded-full bg-fg text-app text-sm font-medium transition-opacity hover:opacity-85 cursor-pointer"
        >
          Retry
        </button>
        <button
          type="button"
          onClick={() => router.history.back()}
          className="px-5 py-2 rounded-full bg-surface-strong hover:bg-surface-soft text-fg text-sm font-medium transition-colors cursor-pointer"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
