import { useState } from "react";
import { useAdminAllowListUsers, useAdminUserSearch } from "../hooks/use-admin-granular-allow-list";
import type { AdminAllowListUser } from "../types/allow-list";
import { AdminAllowListUserDetail } from "./admin-allow-list-user-detail";
import { AdminUserAvatar } from "./admin-user-avatar";

type Props = {
  enabled: boolean;
  instanceRestricted: boolean;
  onToast: (message: string) => void;
};

function avatarUser(user: AdminAllowListUser) {
  return {
    ...user,
    role: "user" as const,
    publicUsername: null,
    bio: null,
    avatarUrl: user.avatarUrl ?? null,
    avatarType: user.avatarType ?? null,
    avatarCode: user.avatarCode ?? null,
    suspended: false,
    verified: false,
    createdAt: 0,
  };
}

function accessLabel(user: AdminAllowListUser, instanceRestricted: boolean): string {
  if (user.accessMode === "allow_list") return "User restricted";
  if (!instanceRestricted) return "Unrestricted";
  return user.adminManagedAccessMode ? "Admin override" : "Instance restricted";
}

export function AdminAllowListUsers({ enabled, instanceRestricted, onToast }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminAllowListUser | null>(null);
  const searching = search.trim().length >= 2;
  const managedQuery = useAdminAllowListUsers(enabled && !searching);
  const searchQuery = useAdminUserSearch(search, enabled && searching);
  const managedUsers = managedQuery.data?.pages.flatMap((page) => page.items) ?? [];
  const visibleUsers = searching ? (searchQuery.data ?? []) : managedUsers;
  const loading = searching ? searchQuery.isLoading : managedQuery.isLoading;

  return (
    <section className="min-w-0 border-t border-border pt-4">
      <div className="mb-3 flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-fg">Specific users</h2>
        <p className="text-xs text-fg-soft">
          Users with admin-managed access appear here. Search to configure another account.
        </p>
      </div>
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by email or name"
        className="h-10 w-full border border-border bg-app px-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-border-strong"
      />
      <div className="mt-3 border-y border-border">
        {loading ? (
          <div className="px-3 py-4 text-sm text-fg-soft">Searching users...</div>
        ) : visibleUsers.length === 0 ? (
          <div className="px-3 py-4 text-sm text-fg-soft">
            {searching ? "No users found." : "No users are managed by allow-list rules yet."}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visibleUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelected(user)}
                className={`flex w-full min-w-0 items-center gap-3 border-l-2 py-2.5 pl-2 pr-0 text-left transition-colors hover:border-border-strong ${
                  selected?.id === user.id ? "border-fg" : "border-transparent"
                }`}
              >
                <AdminUserAvatar user={avatarUser(user)} className="h-9 w-9 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-fg">{user.name || user.email}</p>
                  <p className="truncate text-xs text-fg-soft">{user.email}</p>
                </div>
                <span className="shrink-0 text-xs text-fg-soft">
                  {accessLabel(user, instanceRestricted)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {!searching && managedQuery.hasNextPage && (
        <button
          type="button"
          disabled={managedQuery.isFetchingNextPage}
          onClick={() => {
            void managedQuery.fetchNextPage();
          }}
          className="mt-3 h-8 border border-border px-3 text-xs text-fg-soft transition-colors hover:border-border-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-60"
        >
          {managedQuery.isFetchingNextPage ? "Loading..." : "Load more users"}
        </button>
      )}
      {selected && (
        <div className="mt-6">
          <AdminAllowListUserDetail
            user={selected}
            instanceRestricted={instanceRestricted}
            onToast={onToast}
          />
        </div>
      )}
    </section>
  );
}
