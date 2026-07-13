import { ArrowUpRight, AudioWaveform, Bug, CircleAlert, ShieldAlert, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  readPlaybackMode,
  setPlaybackMode,
  subscribeClassicPlaybackRequest,
} from "../lib/playback-mode";

const PAPER_URL = "https://priveetee.github.io/Docs-PipePipe/developer-guide/introduction.html";
const ISSUES_URL = "https://github.com/Priveetee/TypeType/issues/new/choose";

const CLASSIC_FAILURES = [
  "Sign in to confirm you're not a bot",
  "Video unavailable",
  "Endless loading",
  "Seeks that never recover",
];

export function PlaybackTransitionNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (readPlaybackMode() === "legacy") setOpen(true);
    return subscribeClassicPlaybackRequest(() => setOpen(true));
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  function useSabr() {
    setPlaybackMode("sabr");
    setOpen(false);
  }

  function continueWithClassic() {
    setPlaybackMode("legacy");
    setOpen(false);
  }

  return createPortal(
    <>
      <button
        type="button"
        aria-label="Close playback notice"
        className="fixed inset-0 z-50 cursor-default bg-black/65 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="playback-transition-title"
        aria-describedby="playback-transition-description"
        className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-1rem)] w-[min(42rem,calc(100vw-1rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border-strong bg-surface shadow-2xl"
      >
        <header className="flex items-start gap-4 border-b border-border px-5 py-5 sm:px-7 sm:py-6">
          <ShieldAlert className="mt-0.5 shrink-0 text-accent" size={24} />
          <div className="min-w-0 flex-1">
            <p id="playback-transition-title" className="text-lg font-semibold text-fg">
              YouTube playback is changing
            </p>
            <p className="mt-1 text-sm text-fg-soft">
              Classic still exists, but it is less reliable.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close playback notice"
            title="Close"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-fg-muted hover:bg-surface-soft hover:text-fg"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
          <p id="playback-transition-description" className="text-sm leading-6 text-fg-muted">
            Alternative clients have relied on classic DASH and HLS extraction for years. YouTube is
            restricting that path more often, so a healthy self-hosted instance can still fail in
            ways that look like a server problem.
          </p>

          <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {CLASSIC_FAILURES.map((failure) => (
              <li key={failure} className="flex items-center gap-2 text-sm text-fg-muted">
                <CircleAlert className="shrink-0 text-fg-soft" size={15} />
                <span>{failure}</span>
              </li>
            ))}
          </ul>

          <div className="border-l-2 border-accent pl-4">
            <p className="text-sm font-medium text-fg">SABR is the recommended mode.</p>
            <p className="mt-1 text-sm leading-6 text-fg-muted">
              It follows YouTube&apos;s current delivery path. TypeType keeps Classic available
              while it still works, but it may stop working for individual videos or entire
              instances.
            </p>
          </div>

          <p className="text-sm leading-6 text-fg-muted">
            If SABR breaks on a video, please report it on GitHub with the video URL and what
            happened. Those reports directly help improve this release.
          </p>
        </div>

        <div className="grid gap-3 border-t border-border bg-surface-strong/40 px-5 py-5 sm:grid-cols-[1fr_auto] sm:px-7">
          <button
            type="button"
            onClick={useSabr}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-accent px-5 text-sm font-semibold text-on-accent shadow-sm hover:bg-accent-strong"
          >
            <AudioWaveform size={18} />
            Switch to SABR
          </button>
          <button
            type="button"
            onClick={continueWithClassic}
            className="h-11 rounded-md border border-border-strong bg-surface px-5 text-sm font-medium text-fg-muted hover:bg-surface-soft hover:text-fg"
          >
            Continue with Classic
          </button>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:col-span-2">
            <a
              href={ISSUES_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent-strong"
            >
              <Bug size={15} />
              Report a SABR bug
              <ArrowUpRight size={14} />
            </a>
            <a
              href={PAPER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg"
            >
              Read the technical paper
              <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
