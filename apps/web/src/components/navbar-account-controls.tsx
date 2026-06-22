import { Link } from "@tanstack/react-router";
import { getStoredAdminSection } from "../lib/admin-console-section";
import { logoutSession } from "../lib/auth-session";
import { goto } from "../lib/route-redirect";
import { getStoredSettingsSection } from "../lib/settings-section";
import type { AuthMe, AuthStatus } from "../types/auth";
import { ProfileAvatar } from "./profile-avatar";
import { ThemeToggleButton } from "./theme-toggle-button";

type Props = {
  status: AuthStatus;
  isAuthed: boolean;
  isGuest: boolean;
  isAdmin: boolean;
  me: AuthMe | null;
  isMobile: boolean;
  signOut: () => void;
};

function loginHref() {
  const path = window.location.pathname;
  const search = window.location.search;
  const redirect = `${path}${search}`;
  return `/login?redirect=${encodeURIComponent(redirect)}`;
}

function statusLabel(status: AuthStatus): string {
  if (status === "guest") return "Guest";
  if (status === "authenticated") return "Connected";
  if (status === "loading") return "Loading";
  return "Signed out";
}

export function NavbarAccountControls({
  status,
  isAuthed,
  isGuest,
  isAdmin,
  me,
  isMobile,
  signOut,
}: Props) {
  const profileName = me?.publicUsername?.trim() ? me.publicUsername : null;

  async function handleSignOut() {
    await logoutSession();
    signOut();
  }

  if (isMobile) {
    if (!isAuthed || isGuest || !me) {
      return (
        <div className="inline-flex items-center gap-2">
          <ThemeToggleButton />
          <a
            href={loginHref()}
            className="h-8 px-3 inline-flex items-center text-xs rounded-full bg-surface-strong hover:bg-surface-soft text-fg"
          >
            Sign in
          </a>
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2">
        <ThemeToggleButton />
        <Link to="/profile" className="inline-flex h-9 w-9 items-center justify-center">
          <ProfileAvatar me={me} className="h-8 w-8" plain />
        </Link>
      </div>
    );
  }

  return (
    <>
      {!isAuthed || isGuest || !me ? (
        <span className="hidden sm:inline text-[11px] uppercase tracking-wider text-fg-soft px-2">
          {statusLabel(status)}
        </span>
      ) : (
        <div className="hidden sm:inline-flex items-center gap-2">
          <Link to="/profile" className="inline-flex h-8 w-8 items-center justify-center">
            <ProfileAvatar me={me} className="h-7 w-7" plain />
          </Link>
          <ThemeToggleButton />
          {profileName && (
            <Link
              to="/profile"
              className="max-w-28 truncate text-sm font-medium text-fg hover:text-accent"
            >
              {profileName}
            </Link>
          )}
        </div>
      )}
      {!isAuthed && (
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <a
            href={loginHref()}
            className="h-8 px-3 inline-flex items-center text-xs rounded-full bg-surface-strong hover:bg-surface-soft text-fg"
          >
            Sign in
          </a>
          <button
            type="button"
            onClick={() => goto("/")}
            className="hidden sm:inline-flex h-8 items-center justify-center px-3 text-xs rounded-full bg-surface hover:bg-surface-strong text-fg-muted"
          >
            Browse
          </button>
        </div>
      )}
      {isAuthed && (
        <div className="flex items-center gap-2">
          {(isGuest || !me) && <ThemeToggleButton />}
          {!isGuest && me && (
            <Link
              to="/profile"
              className="inline-flex h-8 w-8 items-center justify-center sm:hidden"
            >
              <ProfileAvatar me={me} className="h-7 w-7" plain />
            </Link>
          )}
          {isGuest && (
            <>
              <a
                href={loginHref()}
                className="h-8 px-3 inline-flex items-center text-xs rounded-full bg-surface-strong hover:bg-surface-soft text-fg"
              >
                Login
              </a>
              <Link
                to="/register"
                search={{ redirect: undefined }}
                className="h-8 px-3 inline-flex items-center text-xs rounded-full bg-fg text-app hover:bg-fg/90"
              >
                Register
              </Link>
            </>
          )}
          {!isGuest && !isAdmin && (
            <Link
              to="/settings"
              search={{ section: getStoredSettingsSection() }}
              className="hidden sm:inline-flex h-8 px-3 items-center text-xs rounded-full bg-surface-strong hover:bg-surface-soft text-fg"
            >
              Account
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin-console"
              search={{ section: getStoredAdminSection() }}
              className="h-8 px-3 inline-flex items-center text-xs rounded-full bg-surface-strong hover:bg-surface-soft text-fg"
            >
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={() => void handleSignOut()}
            className="h-8 px-3 text-xs rounded-full bg-surface-strong hover:bg-surface-soft text-fg"
          >
            Sign out
          </button>
        </div>
      )}
    </>
  );
}
