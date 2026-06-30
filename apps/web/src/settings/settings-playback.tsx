import { useEffect, useRef, useState } from "react";
import { usePlaybackMode } from "../hooks/use-playback-mode";
import { useSettings } from "../hooks/use-settings";
import { useSkipPlaylistAutoplayScreen } from "../hooks/use-skip-playlist-autoplay-screen";
import { PLAYBACK_ROW, PlaybackNumberRow, PlaybackToggleRow } from "./settings-playback-row";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const CARD = "bg-surface rounded-xl border border-border divide-y divide-border";

const QUALITY_OPTIONS = ["144p", "240p", "360p", "480p", "720p", "1080p", "1440p", "2160p"];

type DropdownProps = {
  value: string;
  onChange: (q: string) => void;
};

function QualityDropdown({ value, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div ref={ref} className="relative ml-6 flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-surface-strong border border-border-strong text-fg text-xs rounded-lg px-3 py-1.5 hover:bg-surface-soft transition-colors"
      >
        {value}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          role="img"
          aria-label="toggle"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-surface-strong border border-border-strong rounded-lg overflow-hidden z-10 min-w-[72px] shadow-lg">
          {QUALITY_OPTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                onChange(q);
                setOpen(false);
              }}
              className={`block w-full text-left px-3 py-2 text-xs transition-colors ${
                q === value
                  ? "text-fg bg-surface-soft"
                  : "text-fg-muted hover:bg-surface-soft hover:text-fg"
              }`}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function SettingsPlayback() {
  const { settings, update } = useSettings();
  const { playbackMode, setMode } = usePlaybackMode();
  const { skipPlaylistAutoplayScreen, setSkipPlaylistAutoplayScreen } =
    useSkipPlaylistAutoplayScreen();
  const compatibilityMode = playbackMode === "ios-legacy-compat";
  const autoplayCountdownSeconds = Math.min(
    60,
    Math.max(0, Math.round(settings.autoplayCountdownSeconds)),
  );

  return (
    <section className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>Playback</p>
      <div className={CARD}>
        <PlaybackToggleRow
          title="Autoplay"
          description="Automatically play the next video"
          checked={settings.autoplay}
          onClick={() => update.mutate({ autoplay: !settings.autoplay })}
        />
        <PlaybackNumberRow
          title="Autoplay countdown"
          description="Seconds before autoplay advances, or 0 for immediate playlists"
          value={autoplayCountdownSeconds}
          min={0}
          max={60}
          onChange={(value) =>
            update.mutate({ autoplayCountdownSeconds: Math.min(60, Math.max(0, value)) })
          }
        />
        <PlaybackToggleRow
          title="Skip playlist autoplay screen"
          description="Play the next playlist item immediately while keeping the countdown for recommendations"
          checked={skipPlaylistAutoplayScreen}
          onClick={() => setSkipPlaylistAutoplayScreen(!skipPlaylistAutoplayScreen)}
        />
        <PlaybackToggleRow
          title="Audio-only playback"
          description="Load a backend-provided audio stream when available"
          checked={settings.audioOnlyPlayback}
          onClick={() => update.mutate({ audioOnlyPlayback: !settings.audioOnlyPlayback })}
        />
        <div className={PLAYBACK_ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Default quality</span>
            <span className="text-xs text-fg-soft">Preferred video resolution</span>
          </div>
          <QualityDropdown
            value={settings.defaultQuality}
            onChange={(q) => update.mutate({ defaultQuality: q })}
          />
        </div>
        <PlaybackToggleRow
          title="Enable high quality playback"
          description="Allows VP9/AV1 adaptive streams when supported. May not work on all browsers or devices."
          checked={settings.enableHighQualityPlayback}
          onClick={() =>
            update.mutate({ enableHighQualityPlayback: !settings.enableHighQualityPlayback })
          }
        />
        <PlaybackToggleRow
          title="Compatibility playback mode"
          description="Prioritize reliable iOS legacy playback over adaptive behavior"
          checked={compatibilityMode}
          onClick={() => setMode(compatibilityMode ? "adaptive" : "ios-legacy-compat")}
        />
      </div>
    </section>
  );
}
