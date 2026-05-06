export type RedirectTarget =
  | "/"
  | "/import"
  | "/history"
  | "/playlists"
  | "/privacy"
  | "/profile"
  | "/settings"
  | "/subscriptions"
  | `/shorts?v=${string}`;

const SHORTS_REDIRECT_PREFIX = "/shorts?v=";

const PROTECTED_PREFIXES = [
  "/import",
  "/history",
  "/playlists",
  "/privacy",
  "/profile",
  "/settings",
  "/subscriptions",
];
const AUTH_PAGES = ["/login", "/register", "/reset-password"];

export function requiresAuth(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAdminRoute(pathname: string): boolean {
  return (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/admin-console" ||
    pathname.startsWith("/admin-console/")
  );
}

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`));
}

export function sanitizeRedirect(value: string | undefined): RedirectTarget {
  if (!value) return "/";
  if (value.startsWith(SHORTS_REDIRECT_PREFIX)) return value as `/shorts?v=${string}`;
  if (value === "/import") return "/import";
  if (value === "/history") return "/history";
  if (value === "/privacy") return "/privacy";
  if (value === "/profile") return "/profile";
  if (value === "/settings") return "/settings";
  if (value === "/subscriptions") return "/subscriptions";
  if (value === "/playlists" || value.startsWith("/playlists/")) return "/playlists";
  return "/";
}
