import { useEffect, useRef, useState } from "react";
import { usePlaybackMode } from "../hooks/use-playback-mode";
import { useSettings } from "../hooks/use-settings";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const CARD = "bg-surface rounded-xl border border-border divide-y divide-border";
const ROW = "flex items-center justify-between px-4 py-4";

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
  const compatibilityMode = playbackMode === "ios-legacy-compat";

  return (
    <section className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>Playback</p>
      <div className={CARD}>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Autoplay</span>
            <span className="text-xs text-fg-soft">Automatically play the next video</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.autoplay}
            onClick={() => update.mutate({ autoplay: !settings.autoplay })}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ml-6 ${
              settings.autoplay ? "bg-fg" : "bg-surface-soft"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
                settings.autoplay ? "translate-x-5 bg-surface" : "translate-x-0 bg-surface-soft"
              }`}
            />
          </button>
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Default quality</span>
            <span className="text-xs text-fg-soft">Preferred video resolution</span>
          </div>
          <QualityDropdown
            value={settings.defaultQuality}
            onChange={(q) => update.mutate({ defaultQuality: q })}
          />
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Enable high quality playback</span>
            <span className="text-xs text-fg-soft">
              Allows VP9/AV1 adaptive streams when supported. May not work on all browsers or
              devices.
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.enableHighQualityPlayback}
            onClick={() =>
              update.mutate({ enableHighQualityPlayback: !settings.enableHighQualityPlayback })
            }
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ml-6 ${
              settings.enableHighQualityPlayback ? "bg-fg" : "bg-surface-soft"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
                settings.enableHighQualityPlayback
                  ? "translate-x-5 bg-surface"
                  : "translate-x-0 bg-surface-soft"
              }`}
            />
          </button>
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Compatibility playback mode</span>
            <span className="text-xs text-fg-soft">
              Prioritize reliable iOS legacy playback over adaptive behavior
            </span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={compatibilityMode}
            onClick={() => setMode(compatibilityMode ? "adaptive" : "ios-legacy-compat")}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ml-6 ${
              compatibilityMode ? "bg-fg" : "bg-surface-soft"
            }`}
          >
            <span
              className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full transition-all duration-200 ${
                compatibilityMode ? "translate-x-5 bg-surface" : "translate-x-0 bg-surface-soft"
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
