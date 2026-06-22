export type AdminSection = "settings" | "allow-list" | "users" | "sessions" | "issues";

const ADMIN_SECTION_KEY = "typetype-admin-section";

export function isAdminSection(value: unknown): value is AdminSection {
  return (
    value === "settings" ||
    value === "allow-list" ||
    value === "users" ||
    value === "sessions" ||
    value === "issues"
  );
}

export function getStoredAdminSection(): AdminSection {
  if (typeof window === "undefined") return "issues";
  const stored = window.localStorage.getItem(ADMIN_SECTION_KEY);
  return isAdminSection(stored) ? stored : "issues";
}

export function rememberAdminSection(section: AdminSection) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_SECTION_KEY, section);
}
