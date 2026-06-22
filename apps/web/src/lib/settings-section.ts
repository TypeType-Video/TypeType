export type SettingsSection =
  | "playback"
  | "video"
  | "home"
  | "language"
  | "service"
  | "import"
  | "privacy"
  | "blocked";

const SETTINGS_SECTION_KEY = "typetype-settings-section";

export function isSettingsSection(value: unknown): value is SettingsSection {
  return (
    value === "playback" ||
    value === "video" ||
    value === "home" ||
    value === "language" ||
    value === "service" ||
    value === "import" ||
    value === "privacy" ||
    value === "blocked"
  );
}

export function getStoredSettingsSection(): SettingsSection {
  if (typeof window === "undefined") return "playback";
  const stored = window.localStorage.getItem(SETTINGS_SECTION_KEY);
  return isSettingsSection(stored) ? stored : "playback";
}

export function rememberSettingsSection(section: SettingsSection) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SETTINGS_SECTION_KEY, section);
}
