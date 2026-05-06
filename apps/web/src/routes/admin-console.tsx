import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminBugReportsSection } from "../components/admin-bug-reports-section";
import { AdminConsoleHeader } from "../components/admin-console-header";
import { AdminConsoleNav } from "../components/admin-console-nav";
import { AdminSessionsSection } from "../components/admin-sessions-section";
import { AdminSettingsSection } from "../components/admin-settings-section";
import { AdminUsersSection } from "../components/admin-users-section";
import { Toast } from "../components/toast";
import { useAuth } from "../hooks/use-auth";
import { goto } from "../lib/route-redirect";

type AdminSection = "settings" | "users" | "sessions" | "issues";

function isSection(value: unknown): value is AdminSection {
  return value === "settings" || value === "users" || value === "sessions" || value === "issues";
}

function availableSections(isAdmin: boolean, isModerator: boolean): AdminSection[] {
  if (isAdmin) return ["settings", "users", "sessions", "issues"];
  if (isModerator) return ["issues"];
  return [];
}

function sectionLabel(section: AdminSection): string {
  if (section === "issues") return "Issues";
  if (section === "users") return "Users";
  if (section === "sessions") return "Sessions";
  return "Settings";
}

function AdminConsolePage() {
  const { isAdmin, isModerator, me } = useAuth();
  const { section } = Route.useSearch();
  const navigate = useNavigate({ from: "/admin-console" });
  const [toast, setToast] = useState<string | null>(null);
  const canAccessAdmin = isAdmin || isModerator;
  const sections = availableSections(isAdmin, isModerator);
  const activeSection = sections.includes(section) ? section : (sections[0] ?? "issues");

  useEffect(() => {
    if (!canAccessAdmin || section === activeSection) return;
    navigate({ search: { section: activeSection }, replace: true });
  }, [activeSection, canAccessAdmin, navigate, section]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!canAccessAdmin) {
    goto("/");
    return null;
  }

  return (
    <div className="flex flex-col gap-5 pt-2 [animation:page-fade-in_0.2s_ease-out]">
      <AdminConsoleNav
        items={sections.map((key) => ({
          key,
          label: sectionLabel(key),
        }))}
        active={activeSection}
        onSelect={(next) => navigate({ search: { section: next } })}
      />
      <AdminConsoleHeader section={activeSection} />
      {activeSection === "settings" && isAdmin && (
        <AdminSettingsSection enabled={isAdmin} onToast={setToast} />
      )}
      {activeSection === "users" && isAdmin && (
        <AdminUsersSection enabled={isAdmin} currentUserId={me?.id ?? null} onToast={setToast} />
      )}
      {activeSection === "sessions" && isAdmin && <AdminSessionsSection enabled={isAdmin} />}
      {activeSection === "issues" && (
        <AdminBugReportsSection enabled={canAccessAdmin} isAdmin={isAdmin} onToast={setToast} />
      )}
      <Toast message={toast} />
    </div>
  );
}

export const Route = createFileRoute("/admin-console")({
  validateSearch: (search: Record<string, unknown>) => ({
    section: isSection(search.section) ? search.section : "issues",
  }),
  component: AdminConsolePage,
});
