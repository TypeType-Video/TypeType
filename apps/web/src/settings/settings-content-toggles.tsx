import { useSettings } from "../hooks/use-settings";
import type { SettingsItem } from "../types/user";

const ROW = "flex items-center justify-between gap-4 px-4 py-4";

type ToggleKey = Extract<
  keyof SettingsItem,
  | "autoplay"
  | "hideContinueWatching"
  | "hideHomeRecommendations"
  | "hideRelatedVideos"
  | "hideComments"
  | "hideShorts"
>;

type ToggleOption = {
  key: ToggleKey;
  label: string;
  description: string;
  area: string;
};

const WATCH_OPTIONS: ToggleOption[] = [
  {
    key: "autoplay",
    label: "Autoplay next video",
    description: "Automatically continue with the first item in the suggestions column.",
    area: "Watch",
  },
  {
    key: "hideRelatedVideos",
    label: "Related videos",
    description: "Hide the suggestions column on watch pages.",
    area: "Watch",
  },
  {
    key: "hideComments",
    label: "Comments and danmaku",
    description: "Stop loading watch comments, Shorts comments, and bullet comments.",
    area: "Watch + Shorts",
  },
];

const DISCOVERY_OPTIONS: ToggleOption[] = [
  {
    key: "hideContinueWatching",
    label: "Continue watching",
    description: "Hide in-progress videos from the home page.",
    area: "Home",
  },
  {
    key: "hideHomeRecommendations",
    label: "Home recommendations",
    description: "Hide personalized recommendations from the home page.",
    area: "Home",
  },
  {
    key: "hideShorts",
    label: "Shorts surface",
    description: "Hide Shorts navigation and block the Shorts page.",
    area: "Shorts",
  },
];

function ToggleSwitch({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={`relative h-5 w-10 flex-shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-fg" : "bg-surface-soft"
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full transition-all duration-200 ${
          checked ? "translate-x-5 bg-surface" : "translate-x-0 bg-surface-soft"
        }`}
      />
    </button>
  );
}

function ToggleRows({ options }: { options: ToggleOption[] }) {
  const { settings, update } = useSettings();
  return options.map((option) => (
    <div key={option.key} className={ROW}>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-fg">{option.label}</span>
          <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[10px] text-fg-soft">
            {option.area}
          </span>
        </div>
        <span className="text-xs text-fg-soft">{option.description}</span>
      </div>
      <ToggleSwitch
        checked={settings[option.key]}
        onClick={() => update.mutate({ [option.key]: !settings[option.key] })}
      />
    </div>
  ));
}

export function SettingsContentToggles() {
  return (
    <>
      <div className="bg-surface-soft/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-fg-soft">
        Watch page
      </div>
      <ToggleRows options={WATCH_OPTIONS} />
      <div className="bg-surface-soft/30 px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-fg-soft">
        Discovery surfaces
      </div>
      <ToggleRows options={DISCOVERY_OPTIONS} />
    </>
  );
}
