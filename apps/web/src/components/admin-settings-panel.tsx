import type { AdminSettings } from "../types/admin";

type Props = {
  settings: AdminSettings;
  pending: boolean;
  onToggle: (key: keyof AdminSettings) => void;
};

const ROW =
  "flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3";

export function AdminSettingsPanel({ settings, pending, onToggle }: Props) {
  return (
    <section className="rounded-xl border border-border bg-surface/70 p-4">
      <div className="mb-3">
        <h2 className="text-sm font-semibold text-fg">Instance access</h2>
        <p className="text-xs text-fg-soft">Control who can register or browse as guest.</p>
      </div>
      <div className="space-y-2">
        <SettingToggle
          label="Allow registrations"
          value={settings.allowRegistration}
          pending={pending}
          onClick={() => onToggle("allowRegistration")}
        />
        <SettingToggle
          label="Allow guest mode"
          value={settings.allowGuest}
          pending={pending}
          onClick={() => onToggle("allowGuest")}
        />
        <SettingToggle
          label="Track active sessions"
          value={settings.activeSessionsEnabled}
          pending={pending}
          onClick={() => onToggle("activeSessionsEnabled")}
        />
      </div>
    </section>
  );
}

type ToggleProps = {
  label: string;
  value: boolean;
  pending: boolean;
  onClick: () => void;
};

function SettingToggle({ label, value, pending, onClick }: ToggleProps) {
  return (
    <div className={ROW}>
      <span className="text-sm text-fg">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={pending}
        onClick={onClick}
        className={`relative h-5 w-10 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          value ? "bg-fg" : "bg-surface-soft"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full transition-all ${
            value ? "translate-x-5 bg-surface" : "translate-x-0 bg-surface-soft"
          }`}
        />
      </button>
    </div>
  );
}
