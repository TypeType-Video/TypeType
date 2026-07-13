import { ArrowUpRight, AudioWaveform, TriangleAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePlaybackMode } from "../hooks/use-playback-mode";

const DISMISS_KEY = "typetype-sabr-notice-v2";
const PAPER_URL = "https://priveetee.github.io/Docs-PipePipe/developer-guide/introduction.html";

export function PlaybackTransitionNotice() {
  const { playbackMode, setMode } = usePlaybackMode();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (playbackMode === "sabr") {
      setOpen(false);
      return;
    }
    setOpen(window.localStorage.getItem(DISMISS_KEY) !== "dismissed");
  }, [playbackMode]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      window.localStorage.setItem(DISMISS_KEY, "dismissed");
      setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  function keepClassic() {
    window.localStorage.setItem(DISMISS_KEY, "dismissed");
    setOpen(false);
  }

  function enableSabr() {
    window.localStorage.setItem(DISMISS_KEY, "dismissed");
    setOpen(false);
    setMode("sabr");
  }

  return createPortal(
    <>
      <div
        role="none"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={keepClassic}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="playback-transition-title"
        aria-describedby="playback-transition-description"
        className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100vh-2rem)] w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-xl border border-border-strong bg-surface p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 shrink-0 text-accent" size={22} />
          <div className="min-w-0 flex-1">
            <p id="playback-transition-title" className="text-base font-semibold text-fg">
              YouTube playback is changing
            </p>
            <p
              id="playback-transition-description"
              className="mt-3 text-sm leading-6 text-fg-muted"
            >
              A proven extraction method has long let alternative clients retrieve classic DASH and
              HLS streams. YouTube is restricting that path more often. Self-hosted instances may
              start seeing &quot;Sign in to confirm you're not a bot,&quot; &quot;Video
              unavailable,&quot; endless loading, or failed seeks even when the instance is healthy.
            </p>
            <p className="mt-3 text-sm leading-6 text-fg-muted">
              TypeType keeps Classic available for now. SABR follows YouTube's current delivery path
              and is the recommended mode.
            </p>
          </div>
          <button
            type="button"
            aria-label="Keep Classic and close"
            title="Keep Classic and close"
            onClick={keepClassic}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-surface-soft hover:text-fg"
          >
            <X size={17} />
          </button>
        </div>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={enableSabr}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-on-accent hover:bg-accent-strong"
          >
            <AudioWaveform size={16} />
            Enable SABR
          </button>
          <button
            type="button"
            onClick={keepClassic}
            className="h-9 rounded-md bg-surface-strong px-3 text-sm text-fg-muted hover:bg-surface-soft hover:text-fg"
          >
            Keep Classic for now
          </button>
          <a
            href={PAPER_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-9 items-center justify-center gap-1.5 px-2 text-sm text-accent hover:text-accent-strong sm:ml-auto"
          >
            Read the technical paper
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </>,
    document.body,
  );
}
