import { AudioWaveform } from "lucide-react";
import { usePlaybackMode } from "../hooks/use-playback-mode";

export function NavbarPlaybackMode() {
  const { playbackMode, setMode } = usePlaybackMode();
  const sabrEnabled = playbackMode === "sabr";
  const label = sabrEnabled ? "Use classic playback" : "Use SABR playback";

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={sabrEnabled}
      title={label}
      onClick={() => setMode(sabrEnabled ? "legacy" : "sabr")}
      className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-2 text-xs font-medium transition-colors ${
        sabrEnabled
          ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent/15"
          : "border-border-strong bg-surface-strong text-fg-muted hover:bg-surface-soft hover:text-fg"
      }`}
    >
      <AudioWaveform size={16} />
      <span className="hidden lg:inline">{sabrEnabled ? "SABR" : "Classic"}</span>
    </button>
  );
}
