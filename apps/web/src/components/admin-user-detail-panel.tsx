import { useState } from "react";
import type { AuthRole, AuthUser } from "../types/auth";
import { AdminUserAvatar } from "./admin-user-avatar";
import { AdminUserIdentityForm } from "./admin-user-identity-form";

type AdminUserDetailPanelProps = {
  user: AuthUser;
  busy: boolean;
  onRole: (id: string, role: AuthRole) => void;
  onSuspend: (id: string, suspended: boolean) => void;
  onReset: (id: string, email: string) => void;
  onMessage: (message: string) => void;
};

const ROLE_OPTIONS: AuthRole[] = ["user", "moderator", "admin"];

function roleClass(active: boolean): string {
  if (active) return "border-fg bg-fg text-app";
  return "border-border-strong bg-surface text-fg-muted hover:border-border-strong";
}

export function AdminUserDetailPanel({
  user,
  busy,
  onRole,
  onSuspend,
  onReset,
  onMessage,
}: AdminUserDetailPanelProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const suspendClass = user.suspended
    ? "border-emerald-800/60 bg-emerald-950/30 text-emerald-200 hover:border-emerald-700"
    : "border-danger/60 bg-danger/30 text-danger-strong hover:border-danger";

  return (
    <aside className="rounded-3xl border border-border bg-surface p-5 lg:sticky lg:top-16 h-fit [animation:admin-panel-slide-in_0.22s_cubic-bezier(0.22,1,0.36,1)]">
      <div className="flex items-center gap-3">
        <AdminUserAvatar user={user} className="h-11 w-11" />
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-fg">{user.name || user.email}</p>
          <p className="truncate text-xs text-fg-muted">{user.email}</p>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-fg-soft break-all">{user.id}</p>
      <AdminUserIdentityForm user={user} disabled={busy} onMessage={onMessage} />

      <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl border border-border bg-app p-1">
        {ROLE_OPTIONS.map((role) => (
          <button
            key={`${user.id}-${role}`}
            type="button"
            disabled={busy || user.role === role}
            onClick={() => onRole(user.id, role)}
            className={`h-8 rounded-md border text-[11px] uppercase tracking-wide transition-colors disabled:opacity-50 ${roleClass(
              user.role === role,
            )}`}
          >
            {role}
          </button>
        ))}
      </div>

      <div className="mt-3 relative">
        <button
          type="button"
          aria-expanded={actionsOpen}
          onClick={() => setActionsOpen((open) => !open)}
          className="ml-auto block h-8 rounded-md border border-border-strong bg-surface px-2.5 text-xs font-medium text-fg transition-all duration-150 hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-strong"
        >
          Actions
        </button>

        {actionsOpen && (
          <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-border-strong bg-surface p-2 shadow-2xl [animation:admin-actions-pop_0.18s_cubic-bezier(0.22,1,0.36,1)]">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onSuspend(user.id, user.suspended);
                setActionsOpen(false);
              }}
              className={`mb-1 h-8 w-full rounded-md border px-2.5 text-left text-xs font-medium transition-colors disabled:opacity-50 ${suspendClass}`}
            >
              {user.suspended ? "Unsuspend" : "Suspend"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onReset(user.id, user.email);
                setActionsOpen(false);
              }}
              className="h-8 w-full rounded-md border border-border-strong bg-surface px-2.5 text-left text-xs font-medium text-fg transition-colors hover:border-border-strong hover:bg-surface-strong disabled:opacity-50"
            >
              Reset token
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
