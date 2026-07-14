import { useSettings } from "../hooks/use-settings";

export function AutoplayToggle() {
  const { settings, update } = useSettings();

  return (
    <div className="flex items-center justify-between border-b border-border pb-3 pt-3">
      <span className="text-sm text-fg-muted">Autoplay</span>
      <button
        type="button"
        role="switch"
        aria-checked={settings.autoplay}
        onClick={() => update.mutate({ autoplay: !settings.autoplay })}
        className={`relative h-5 w-10 rounded-full border transition-colors duration-200 flex-shrink-0 ${
          settings.autoplay ? "border-fg bg-fg" : "border-border-strong bg-surface-strong"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full transition-all duration-200 ${
            settings.autoplay ? "translate-x-5 bg-surface" : "translate-x-0 bg-fg-muted"
          }`}
        />
      </button>
    </div>
  );
}
