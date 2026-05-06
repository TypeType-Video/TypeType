import { useAdminSessions } from "../hooks/use-admin-sessions";
import { useAdminUsers } from "../hooks/use-admin-users";
import { AdminSessionCard } from "./admin-session-card";

type Props = {
  enabled: boolean;
};

export function AdminSessionsSection({ enabled }: Props) {
  const query = useAdminSessions(enabled);
  const usersQuery = useAdminUsers(enabled, 1, 200).query;
  const sessions = query.data ?? [];
  const users = usersQuery.data?.items ?? [];

  if (query.isPending) {
    return (
      <section className="rounded-lg border border-border bg-surface/70 p-4 text-center text-sm text-fg-muted sm:p-6">
        Loading active sessions...
      </section>
    );
  }

  if (query.isError) {
    return (
      <section className="rounded-lg border border-danger bg-danger/30 p-4 text-center text-sm text-danger-strong sm:p-6">
        Unable to load active sessions.
      </section>
    );
  }

  if (sessions.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-surface/70 p-4 text-center text-sm text-fg-muted sm:p-6">
        No active sessions are currently reported.
      </section>
    );
  }

  return (
    <section className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-2 2xl:grid-cols-3">
      {sessions.map((session) => (
        <AdminSessionCard
          key={session.id}
          session={session}
          user={users.find((item) => item.id === session.userId)}
        />
      ))}
    </section>
  );
}
