import { SettingsContentToggles } from "./settings-content-toggles";
import { SettingsSponsorBlockPreferences } from "./settings-sponsorblock-preferences";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const CARD = "bg-surface rounded-xl border border-border divide-y divide-border";

export function SettingsVideoPreferences() {
  return (
    <section className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>Content controls</p>
      <div className={CARD}>
        <SettingsSponsorBlockPreferences />
        <SettingsContentToggles />
      </div>
    </section>
  );
}
