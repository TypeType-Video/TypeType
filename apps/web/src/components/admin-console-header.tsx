import type { AdminSection } from "../lib/admin-console-section";

type Props = {
  section: AdminSection;
};

const TITLES: Record<AdminSection, string> = {
  settings: "Admin Settings",
  "allow-list": "Allow List",
  users: "User Management",
  sessions: "Active Sessions",
  issues: "Issue Triage",
};

const DESCRIPTIONS: Record<AdminSection, string> = {
  settings: "Global moderation and platform switches.",
  "allow-list": "Control which channels are available in allow-list mode.",
  users: "Roles, suspension, and account recovery tools.",
  sessions: "Connected clients, playback state, and recent activity.",
  issues: "Bug reports, diagnostics, status updates, and GitHub sync.",
};

export function AdminConsoleHeader({ section }: Props) {
  return (
    <header className="px-1 pb-1">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-soft">Admin Console</p>
      <h1 className="mt-2 font-mono text-2xl font-semibold tracking-tight text-fg">
        {TITLES[section]}
      </h1>
      <p className="mt-1 text-sm text-fg-muted">{DESCRIPTIONS[section]}</p>
    </header>
  );
}
