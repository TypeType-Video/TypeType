import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSettings } from "../hooks/use-settings";
import { goto } from "../lib/route-redirect";
import {
  getStoredSettingsSection,
  isSettingsSection,
  rememberSettingsSection,
  type SettingsSection,
} from "../lib/settings-section";
import { SettingsBlocked } from "../settings/settings-blocked";
import { SettingsLandingPage } from "../settings/settings-landing-page";
import { SettingsLanguage } from "../settings/settings-language";
import { SettingsNav } from "../settings/settings-nav";
import { SettingsPlayback } from "../settings/settings-playback";
import { SettingsPrivacy } from "../settings/settings-privacy";
import { SettingsService } from "../settings/settings-service";
import { SettingsVideoPreferences } from "../settings/settings-video-preferences";

type Item = {
  key: SettingsSection;
  label: string;
};

const BASE_ITEMS: Item[] = [
  { key: "playback", label: "Playback" },
  { key: "video", label: "Video" },
  { key: "home", label: "Home" },
  { key: "service", label: "Service" },
  { key: "import", label: "Import" },
  { key: "privacy", label: "Privacy" },
  { key: "blocked", label: "Blocked" },
];

function settingsItems(showLanguage: boolean): Item[] {
  if (!showLanguage) return BASE_ITEMS;
  return [
    BASE_ITEMS[0],
    BASE_ITEMS[1],
    BASE_ITEMS[2],
    { key: "language", label: "Language" },
    ...BASE_ITEMS.slice(3),
  ];
}

function SettingsImport() {
  return (
    <section className="flex flex-col gap-3">
      <p className="px-1 text-xs font-medium text-fg-soft uppercase tracking-wider">Migration</p>
      <div className="flex flex-col items-start gap-3 rounded-xl border border-border bg-surface px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-fg">Import from YouTube or PipePipe</span>
          <span className="text-xs text-fg-soft">Open the dedicated import page.</span>
        </div>
        <button
          type="button"
          onClick={() => goto("/import")}
          className="h-9 w-full rounded-md bg-surface px-2.5 text-xs text-fg-muted transition-colors hover:text-fg sm:h-8 sm:w-auto"
        >
          Open import
        </button>
      </div>
    </section>
  );
}

function SettingsPage() {
  const { settings } = useSettings();
  const { section } = Route.useSearch();
  const navigate = useNavigate({ from: "/settings" });
  const items = settingsItems(settings.defaultService === 0);
  const activeSection = items.some((item) => item.key === section) ? section : items[0].key;

  useEffect(() => {
    if (section === activeSection) return;
    navigate({ search: { section: activeSection }, replace: true });
  }, [activeSection, navigate, section]);

  useEffect(() => {
    rememberSettingsSection(activeSection);
  }, [activeSection]);

  return (
    <div className="flex flex-col gap-5 [animation:page-fade-in_0.2s_ease-out]">
      <h1 className="text-lg font-semibold text-fg">Settings</h1>
      <SettingsNav
        items={items}
        active={activeSection}
        onSelect={(next) => navigate({ search: { section: next } })}
      />
      {activeSection === "playback" && <SettingsPlayback />}
      {activeSection === "video" && <SettingsVideoPreferences />}
      {activeSection === "home" && <SettingsLandingPage />}
      {activeSection === "language" && settings.defaultService === 0 && <SettingsLanguage />}
      {activeSection === "service" && <SettingsService />}
      {activeSection === "import" && <SettingsImport />}
      {activeSection === "privacy" && <SettingsPrivacy />}
      {activeSection === "blocked" && <SettingsBlocked />}
    </div>
  );
}

export const Route = createFileRoute("/settings")({
  validateSearch: (search: Record<string, unknown>) => ({
    section: isSettingsSection(search.section) ? search.section : getStoredSettingsSection(),
  }),
  component: SettingsPage,
});
