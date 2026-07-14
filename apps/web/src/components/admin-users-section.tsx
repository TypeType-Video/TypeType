import { useEffect, useMemo, useState } from "react";
import { useAdminUsers } from "../hooks/use-admin-users";
import { type AdminFilter, matchesAdminFilter } from "../lib/admin-console";
import { AdminUserDetailPanel } from "./admin-user-detail-panel";
import { AdminUserGrid } from "./admin-user-grid";
import { AdminUserToolbar } from "./admin-user-toolbar";
import { AdminUsersPagination } from "./admin-users-pagination";
import { ResetTokenModal } from "./reset-token-modal";

const PAGE_SIZE = 50;

type Props = {
  enabled: boolean;
  currentUserId: string | null;
  onToast: (message: string) => void;
};

export function AdminUsersSection({ enabled, currentUserId, onToast }: Props) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AdminFilter>("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [resetTokenData, setResetTokenData] = useState<{ email: string; token: string } | null>(
    null,
  );
  const { query, role, suspend, resetToken } = useAdminUsers(enabled, page, PAGE_SIZE);

  const users = query.data?.items ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = query.data?.page ?? page;
  const pageStart = total === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = total === 0 ? 0 : Math.min(currentPage * PAGE_SIZE, total);
  const searchTerm = search.trim().toLowerCase();
  const busy = role.isPending || suspend.isPending || resetToken.isPending;

  const filtered = useMemo(
    () =>
      users
        .filter((user) => {
          if (!matchesAdminFilter(user, filter)) return false;
          if (!searchTerm) return true;
          const haystack = `${user.name} ${user.email} ${user.id}`.toLowerCase();
          return haystack.includes(searchTerm);
        })
        .sort((a, b) => Number(new Date(b.createdAt)) - Number(new Date(a.createdAt))),
    [users, filter, searchTerm],
  );

  const selectedUser = filtered.find((user) => user.id === selectedUserId) ?? null;

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedUserId(null);
      return;
    }
    if (selectedUserId && filtered.some((user) => user.id === selectedUserId)) return;
    if (currentUserId && filtered.some((user) => user.id === currentUserId)) {
      setSelectedUserId(currentUserId);
      return;
    }
    setSelectedUserId(filtered[0].id);
  }, [selectedUserId, filtered, currentUserId]);

  return (
    <>
      <AdminUserToolbar
        search={search}
        filter={filter}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onFilterChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
      />
      <AdminUsersPagination
        page={currentPage}
        totalPages={totalPages}
        total={total}
        pageStart={pageStart}
        pageEnd={pageEnd}
        pending={query.isPending}
        onPrev={() => setPage((value) => Math.max(1, value - 1))}
        onNext={() => setPage((value) => Math.min(totalPages, value + 1))}
      />
      {query.isPending && (
        <section className="rounded-lg border border-border bg-surface/70 p-6 text-center text-sm text-fg-muted">
          Loading users...
        </section>
      )}
      {query.isError && (
        <section className="rounded-lg border border-danger bg-danger/30 p-6 text-center text-sm text-danger-strong">
          Unable to load users right now.
        </section>
      )}
      {!query.isPending && !query.isError && filtered.length === 0 && (
        <section className="rounded-lg border border-border bg-surface/70 p-6 text-center text-sm text-fg-muted">
          No user matches this view.
        </section>
      )}
      {!query.isPending && !query.isError && filtered.length > 0 && (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <AdminUserGrid
            users={filtered}
            selectedUserId={selectedUserId}
            onSelectUser={setSelectedUserId}
          />
          {selectedUser ? (
            <AdminUserDetailPanel
              user={selectedUser}
              busy={busy}
              onMessage={onToast}
              onRole={(id, nextRole) => {
                role.mutate(
                  { id, role: nextRole },
                  {
                    onSuccess: () => onToast(`Role set to ${nextRole}`),
                    onError: (error) =>
                      onToast(error instanceof Error ? error.message : "Unable to update role"),
                  },
                );
              }}
              onSuspend={(id, suspendedFlag) => {
                suspend.mutate(
                  { id, suspended: !suspendedFlag },
                  {
                    onSuccess: () =>
                      onToast(!suspendedFlag ? "User suspended" : "User unsuspended"),
                    onError: (error) =>
                      onToast(
                        error instanceof Error ? error.message : "Unable to update suspension",
                      ),
                  },
                );
              }}
              onReset={(id, email) => {
                resetToken.mutate(id, {
                  onSuccess: (result) => setResetTokenData({ email, token: result.resetToken }),
                  onError: (error) =>
                    onToast(
                      error instanceof Error ? error.message : "Unable to generate reset token",
                    ),
                });
              }}
            />
          ) : (
            <div className="hidden lg:block" />
          )}
        </section>
      )}
      {resetTokenData && (
        <ResetTokenModal
          email={resetTokenData.email}
          token={resetTokenData.token}
          onClose={() => setResetTokenData(null)}
          onCopied={() => onToast("Token copied to clipboard")}
        />
      )}
    </>
  );
}
