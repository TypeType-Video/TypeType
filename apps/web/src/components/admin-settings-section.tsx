import { useAdminSettings } from "../hooks/use-admin-settings";
import type { AdminSettings } from "../types/admin";
import { AdminSettingsPanel } from "./admin-settings-panel";

type Props = {
  enabled: boolean;
  onToast: (message: string) => void;
};

type BooleanAdminSetting = {
  [Key in keyof AdminSettings]: AdminSettings[Key] extends boolean ? Key : never;
}[keyof AdminSettings];

export function AdminSettingsSection({ enabled, onToast }: Props) {
  const adminSettings = useAdminSettings(enabled);

  function updateSettings(next: AdminSettings) {
    adminSettings.update.mutate(next, {
      onSuccess: () => onToast("Admin settings updated"),
      onError: (error) =>
        onToast(error instanceof Error ? error.message : "Unable to update admin settings"),
    });
  }

  function toggleSetting(key: BooleanAdminSetting) {
    const current = adminSettings.query.data;
    if (!current) return;
    updateSettings({ ...current, [key]: !current[key] });
  }

  if (adminSettings.query.isPending) {
    return (
      <section className="rounded-lg border border-border bg-surface/70 p-3 text-sm text-fg-muted">
        Loading admin settings...
      </section>
    );
  }

  if (adminSettings.query.isError) {
    const message =
      adminSettings.query.error instanceof Error
        ? adminSettings.query.error.message
        : "Unable to load admin settings.";
    return (
      <section className="rounded-lg border border-danger bg-danger/30 p-3 text-sm text-danger-strong">
        Unable to load admin settings: {message}
      </section>
    );
  }

  if (!adminSettings.query.data) return null;

  return (
    <AdminSettingsPanel
      settings={adminSettings.query.data}
      pending={adminSettings.update.isPending}
      onToggle={toggleSetting}
    />
  );
}
