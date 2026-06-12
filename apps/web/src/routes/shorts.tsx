import { createFileRoute } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { ShortsPlayerShell } from "../components/shorts-player-shell";
import { useSettings } from "../hooks/use-settings";
import { goto } from "../lib/route-redirect";

const SHORTS_BETA_BANNER_KEY = "shorts-beta-banner-dismissed";

function ShortsBetaBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    const hidden = window.localStorage.getItem(SHORTS_BETA_BANNER_KEY) === "1";
    setDismissed(hidden);
  }, []);

  function dismissBanner() {
    window.localStorage.setItem(SHORTS_BETA_BANNER_KEY, "1");
    setDismissed(true);
  }

  if (dismissed) return null;

  return (
    <div
      className="pointer-events-none fixed right-2 z-40 sm:right-4"
      style={{ top: "calc(3.5rem + env(safe-area-inset-top, 0px) + 0.5rem)" }}
    >
      <div className="pointer-events-auto flex w-[min(22rem,calc(100vw-1rem))] items-center gap-2 rounded-lg border border-border-strong bg-app/95 px-3 py-2 shadow-lg backdrop-blur sm:w-[min(24rem,calc(100vw-2rem))]">
        <p className="text-[11px] leading-4 text-fg-muted sm:text-xs">
          The shorts page is still beta and some bugs can happen.
        </p>
        <button
          type="button"
          onClick={dismissBanner}
          className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface text-fg-muted transition-colors hover:bg-surface-strong hover:text-fg"
          aria-label="Dismiss beta notice"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function ShortsPage() {
  const { v } = Route.useSearch();
  const { settings } = useSettings();
  if (settings.hideShorts) {
    return (
      <div className="flex min-h-[45vh] items-center justify-center px-4">
        <div className="flex max-w-sm flex-col items-center gap-3 rounded-xl border border-border bg-surface px-5 py-6 text-center">
          <h1 className="text-base font-semibold text-fg">Shorts are hidden</h1>
          <p className="text-sm text-fg-soft">You can re-enable Shorts from video preferences.</p>
          <button
            type="button"
            onClick={() => goto("/settings")}
            className="mt-1 h-9 rounded-lg bg-fg px-4 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            Open settings
          </button>
        </div>
      </div>
    );
  }
  return (
    <>
      <ShortsBetaBanner />
      <ShortsPlayerShell targetUrl={v} />
    </>
  );
}

export const Route = createFileRoute("/shorts")({
  validateSearch: (search: Record<string, unknown>) => ({
    v: typeof search.v === "string" ? search.v : undefined,
  }),
  component: ShortsPage,
});
