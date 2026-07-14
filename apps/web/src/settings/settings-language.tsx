import { useSettings } from "../hooks/use-settings";
import { LanguageDropdown } from "./language-dropdown";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const CARD = "bg-surface rounded-xl border border-border divide-y divide-border";
const ROW = "flex items-center justify-between px-4 py-4";

type ToggleProps = {
  checked: boolean;
  onClick: () => void;
};

function Toggle({ checked, onClick }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={`relative ml-6 h-5 w-10 flex-shrink-0 rounded-full border transition-colors duration-200 ${checked ? "border-fg bg-fg" : "border-border-strong bg-surface-strong"}`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full transition-all duration-200 ${checked ? "translate-x-5 bg-surface" : "translate-x-0 bg-fg-muted"}`}
      />
    </button>
  );
}

export function SettingsLanguage() {
  const { settings, update } = useSettings();

  return (
    <section className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>Language</p>
      <div className={CARD}>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Subtitles</span>
            <span className="text-xs text-fg-soft">Enable subtitles by default</span>
          </div>
          <Toggle
            checked={settings.subtitlesEnabled}
            onClick={() => update.mutate({ subtitlesEnabled: !settings.subtitlesEnabled })}
          />
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Subtitle language</span>
            <span className="text-xs text-fg-soft">Preferred subtitle track</span>
          </div>
          <LanguageDropdown
            value={settings.defaultSubtitleLanguage}
            onChange={(v) => update.mutate({ defaultSubtitleLanguage: v })}
          />
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Audio language</span>
            <span className="text-xs text-fg-soft">
              {settings.preferOriginalLanguage
                ? "Ignored while original language is forced"
                : "Preferred audio track"}
            </span>
          </div>
          <LanguageDropdown
            value={settings.defaultAudioLanguage}
            onChange={(v) => update.mutate({ defaultAudioLanguage: v })}
            disabled={settings.preferOriginalLanguage}
          />
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Prefer original language</span>
            <span className="text-xs text-fg-soft">Always use the original audio track</span>
          </div>
          <Toggle
            checked={settings.preferOriginalLanguage}
            onClick={() =>
              update.mutate({ preferOriginalLanguage: !settings.preferOriginalLanguage })
            }
          />
        </div>
      </div>
    </section>
  );
}
