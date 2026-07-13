import { ArrowUpRight, AudioWaveform, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { usePlaybackMode } from "../hooks/use-playback-mode";

const DISMISS_KEY = "typetype-sabr-notice-v1";
const PAPER_URL = "https://priveetee.github.io/Docs-PipePipe/developer-guide/introduction.html";

export function PlaybackTransitionNotice() {
  const { playbackMode, setMode } = usePlaybackMode();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(window.localStorage.getItem(DISMISS_KEY) === "dismissed");
  }, []);

  if (playbackMode === "sabr" || dismissed) return null;

  function keepClassic() {
    window.localStorage.setItem(DISMISS_KEY, "dismissed");
    setDismissed(true);
  }

  return (
    <section className="border-y border-accent/25 bg-accent/5 px-4 py-4 sm:px-5">
      <div className="flex items-start gap-3">
        <TriangleAlert className="mt-0.5 shrink-0 text-accent" size={20} />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-fg">YouTube playback is changing</h2>
          <p className="mt-1 max-w-4xl text-sm leading-6 text-fg-muted">
            A proven extraction method has long let alternative clients retrieve classic DASH and
            HLS streams. YouTube is restricting that path more often. Self-hosted instances may
            start seeing &quot;Sign in to confirm you're not a bot,&quot; &quot;Video
            unavailable,&quot; endless loading, or failed seeks even when the instance is healthy.
          </p>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-fg-muted">
            TypeType keeps Classic available for now. SABR follows YouTube's current delivery path
            and is the recommended mode.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMode("sabr")}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-accent px-3 text-sm font-medium text-on-accent hover:bg-accent-strong"
            >
              <AudioWaveform size={16} />
              Enable SABR
            </button>
            <button
              type="button"
              onClick={keepClassic}
              className="h-9 rounded-md border border-border-strong px-3 text-sm text-fg-muted hover:bg-surface-soft hover:text-fg"
            >
              Keep Classic for now
            </button>
            <a
              href={PAPER_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 px-2 text-sm text-accent hover:text-accent-strong"
            >
              Read the technical paper
              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
