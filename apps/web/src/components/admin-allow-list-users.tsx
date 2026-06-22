import { useEffect, useState } from "react";
import { useAdminUserSearch } from "../hooks/use-admin-granular-allow-list";
import type { AdminAllowListUser } from "../types/allow-list";
import { AdminAllowListUserDetail } from "./admin-allow-list-user-detail";

type Props = {
  enabled: boolean;
  onToast: (message: string) => void;
};

export function AdminAllowListUsers({ enabled, onToast }: Props) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminAllowListUser | null>(null);
  const query = useAdminUserSearch(search, enabled);
  const users = query.data ?? [];

  useEffect(() => {
    if (!selected) return;
    if (users.some((user) => user.id === selected.id)) return;
    setSelected(null);
  }, [selected, users]);

  return (
    <section className="border-t border-border pt-4">
      <div className="mb-3 flex flex-col gap-1">
        <h2 className="text-sm font-semibold text-fg">Specific users</h2>
        <p className="text-xs text-fg-soft">Search a user, then configure only that account.</p>
      </div>
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by email or name"
        className="h-10 w-full border border-border bg-app px-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted focus:border-border-strong"
      />
      <div className="mt-3 border-y border-border">
        {search.trim().length < 2 ? (
          <div className="px-3 py-4 text-sm text-fg-soft">Type at least two characters.</div>
        ) : query.isLoading ? (
          <div className="px-3 py-4 text-sm text-fg-soft">Searching users...</div>
        ) : users.length === 0 ? (
          <div className="px-3 py-4 text-sm text-fg-soft">No users found.</div>
        ) : (
          <div className="divide-y divide-border">
            {users.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => setSelected(user)}
                className={`flex w-full items-center gap-3 border-l-2 py-2.5 pl-2 pr-0 text-left transition-colors hover:border-border-strong ${
                  selected?.id === user.id ? "border-fg" : "border-transparent"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-fg">{user.name || user.email}</p>
                  <p className="truncate text-xs text-fg-soft">{user.email}</p>
                </div>
                <span className="text-xs text-fg-soft">
                  {user.accessMode === "allow_list" ? "Allow-list" : "Unrestricted"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      {selected && (
        <div className="mt-6">
          <AdminAllowListUserDetail user={selected} onToast={onToast} />
        </div>
      )}
    </section>
  );
}
