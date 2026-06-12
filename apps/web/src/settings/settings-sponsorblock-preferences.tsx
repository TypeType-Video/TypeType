import { useSettings } from "../hooks/use-settings";
import { SPONSORBLOCK_CATEGORIES, type SponsorBlockCategory } from "../lib/sponsorblock-settings";
import type { SponsorBlockCategoryAction, SponsorBlockMode } from "../types/user";

const ACTIONS: { value: SponsorBlockCategoryAction; label: string }[] = [
  { value: "auto_skip", label: "Skip" },
  { value: "mark_only", label: "Mark" },
  { value: "disabled", label: "Hide" },
];

const MODES: { value: SponsorBlockMode; label: string; description: string }[] = [
  { value: "auto_skip", label: "Skip", description: "Use category rules for automatic skips." },
  { value: "mark_only", label: "Mark", description: "Show matching segments without skipping." },
  { value: "disabled", label: "Off", description: "Ignore all SponsorBlock data." },
];

function GlobalMode() {
  const { settings, update } = useSettings();
  return (
    <div className="flex flex-col gap-3 px-4 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm text-fg">SponsorBlock behavior</span>
        <span className="text-xs text-fg-soft">
          Global behavior first, then category rules decide what gets skipped or marked.
        </span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {MODES.map((option) => {
          const selected = settings.sponsorBlockMode === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => update.mutate({ sponsorBlockMode: option.value })}
              className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                selected
                  ? "border-fg bg-surface-strong text-fg"
                  : "border-border bg-surface text-fg-muted hover:bg-surface-strong hover:text-fg"
              }`}
            >
              <span className="block text-xs font-medium">{option.label}</span>
              <span className="mt-1 block text-[11px] leading-4 text-fg-soft">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CategoryAction({ category }: { category: SponsorBlockCategory }) {
  const { settings, update } = useSettings();
  const value = settings.sponsorBlockCategoryActions[category.id] ?? category.defaultAction;
  return (
    <div className="grid gap-3 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_190px] sm:items-center">
      <div className="flex min-w-0 gap-3">
        <span
          className="mt-1 h-3 w-3 flex-shrink-0 rounded-full border border-border"
          style={{ backgroundColor: category.color }}
        />
        <div className="min-w-0">
          <div className="text-sm text-fg">{category.label}</div>
          <div className="text-xs leading-5 text-fg-soft">{category.description}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 rounded-lg border border-border bg-surface-soft p-1">
        {ACTIONS.map((action) => {
          const selected = action.value === value;
          return (
            <button
              key={action.value}
              type="button"
              onClick={() =>
                update.mutate({
                  sponsorBlockCategoryActions: {
                    ...settings.sponsorBlockCategoryActions,
                    [category.id]: action.value,
                  },
                })
              }
              className={`rounded-md px-2 py-1.5 text-[11px] transition-colors ${
                selected ? "bg-surface text-fg shadow-sm" : "text-fg-soft hover:text-fg"
              }`}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExtraToggles() {
  const { settings, update } = useSettings();
  const toggles = [
    ["sponsorBlockShowCurrentSegment", "Show current segment next to time"],
    ["sponsorBlockShowChapters", "Show SponsorBlock chapters"],
    ["sponsorBlockShowFullVideoLabels", "Show full-video labels"],
    ["sponsorBlockManualSkipOnFullVideo", "Manual skip for full-video labels"],
    ["sponsorBlockSkipNonMusicOnlyOnMusicVideos", "Skip non-music only on music videos"],
    ["sponsorBlockMuteInsteadOfSkip", "Mute segments instead of skipping"],
  ] as const;
  return toggles.map(([key, label]) => (
    <button
      key={key}
      type="button"
      role="switch"
      aria-checked={settings[key]}
      onClick={() => update.mutate({ [key]: !settings[key] })}
      className="flex items-center justify-between gap-3 px-4 py-3 text-left text-sm text-fg"
    >
      <span>{label}</span>
      <span
        className={`h-5 w-10 rounded-full p-0.5 transition-colors ${
          settings[key] ? "bg-fg" : "bg-surface-soft"
        }`}
      >
        <span
          className={`block h-4 w-4 rounded-full transition-transform ${
            settings[key] ? "translate-x-5 bg-surface" : "bg-surface-soft"
          }`}
        />
      </span>
    </button>
  ));
}

export function SettingsSponsorBlockPreferences() {
  const { settings, update } = useSettings();
  return (
    <>
      <GlobalMode />
      <div className="bg-surface-soft/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-fg-soft">
        SponsorBlock categories
      </div>
      {SPONSORBLOCK_CATEGORIES.map((category) => (
        <CategoryAction key={category.id} category={category} />
      ))}
      <div className="bg-surface-soft/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-fg-soft">
        Advanced display
      </div>
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <span className="text-sm text-fg">Minimum segment duration</span>
        <input
          type="number"
          min="0"
          value={settings.sponsorBlockMinimumDuration}
          onChange={(event) =>
            update.mutate({ sponsorBlockMinimumDuration: Number(event.currentTarget.value) })
          }
          className="w-20 rounded-lg border border-border bg-surface-strong px-2 py-1 text-right text-sm text-fg"
        />
      </div>
      <ExtraToggles />
    </>
  );
}
