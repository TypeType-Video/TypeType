import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useSettings } from "../hooks/use-settings";
import { allowHideEverything } from "../lib/hide-everything";
import type { SettingsItem } from "../types/user";
import { HideEverythingToggle } from "./hide-everything-toggle";
import { SettingsDeArrowOptions } from "./settings-dearrow-options";
import { ROW, ToggleSwitch } from "./settings-toggle-switch";

const HIDE_KEYS = [
  "hideContinueWatching",
  "hideHomeRecommendations",
  "hideRelatedVideos",
  "hideComments",
  "hideShorts",
] as const;

function useHideEverythingTrigger() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const allHidden = HIDE_KEYS.every((key) => settings[key]);
  const wasAllHidden = useRef(allHidden);
  useEffect(() => {
    if (allHidden && !wasAllHidden.current) {
      allowHideEverything();
      navigate({ to: "/hide-everything" });
    }
    wasAllHidden.current = allHidden;
  }, [allHidden, navigate]);
}

type ToggleKey = Extract<
  keyof SettingsItem,
  | "autoplay"
  | "deArrowEnabled"
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
];

const DISCOVERY_OPTIONS: ToggleOption[] = [
  {
    key: "deArrowEnabled",
    label: "DeArrow titles and thumbnails",
    description: "Use community-written titles and representative thumbnails for YouTube videos.",
    area: "YouTube",
  },
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
  {
    key: "hideShorts",
    label: "Shorts surface",
    description: "Hide Shorts navigation and block the Shorts page.",
    area: "Shorts",
  },
];

function ToggleRows({ options }: { options: ToggleOption[] }) {
  const { settings, update } = useSettings();
  return options.map((option) => (
    <div key={option.key} className={ROW}>
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-fg text-sm">{option.label}</span>
          <span className="rounded-full bg-surface-soft px-2 py-0.5 text-[10px] text-fg-soft">
            {option.area}
          </span>
        </div>
        <span className="text-fg-soft text-xs">{option.description}</span>
      </div>
      <ToggleSwitch
        checked={settings[option.key]}
        onClick={() => update.mutate({ [option.key]: !settings[option.key] })}
      />
    </div>
  ));
}

export function SettingsWatchToggles() {
  useHideEverythingTrigger();
  return (
    <>
      <div className="bg-surface-soft/30 px-4 py-2 font-medium text-[11px] text-fg-soft uppercase tracking-wider">
        Watch page
      </div>
      <ToggleRows options={WATCH_OPTIONS} />
    </>
  );
}

export function SettingsDiscoveryToggles() {
  useHideEverythingTrigger();
  return (
    <>
      <div className="bg-surface-soft/30 px-4 py-2 font-medium text-[11px] text-fg-soft uppercase tracking-wider">
        Discovery surfaces
      </div>
      <ToggleRows options={DISCOVERY_OPTIONS} />
      <SettingsDeArrowOptions />
      <HideEverythingToggle />
    </>
  );
}
