import { useEffect, useState } from "react";
import { useAccountIdentity } from "../hooks/use-account-identity";

type Props = {
  enabled: boolean;
  onMessage: (message: string) => void;
};

export function AccountIdentitySettings({ enabled, onMessage }: Props) {
  const { query, update } = useAccountIdentity(enabled);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!query.data) return;
    setEmail(query.data.email);
    setName(query.data.name);
  }, [query.data]);

  if (!enabled || query.isPending) return null;
  const managed = query.data?.managedByOidc ?? false;
  const dirty =
    email.trim().toLowerCase() !== query.data?.email || name.trim() !== query.data?.name;

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5 flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-fg">Account identity</p>
        <p className="text-xs text-fg-soft">
          {managed ? "Managed by your identity provider" : "Used for sign-in and account display"}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
          Display name
          <input
            value={name}
            disabled={managed}
            onChange={(event) => setName(event.target.value)}
            className="h-9 rounded-md border border-border-strong bg-app px-3 text-sm text-fg disabled:opacity-60"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs text-fg-muted">
          Email address
          <input
            type="email"
            value={email}
            disabled={managed}
            onChange={(event) => setEmail(event.target.value)}
            className="h-9 rounded-md border border-border-strong bg-app px-3 text-sm text-fg disabled:opacity-60"
          />
        </label>
      </div>
      {!managed && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-1 flex-col gap-1.5 text-xs text-fg-muted">
            Current password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-9 rounded-md border border-border-strong bg-app px-3 text-sm text-fg"
            />
          </label>
          <button
            type="button"
            disabled={!dirty || password.length === 0 || update.isPending}
            onClick={() =>
              update.mutate(
                { email: email.trim(), name: name.trim(), currentPassword: password },
                {
                  onSuccess: () => {
                    setPassword("");
                    onMessage("Account updated");
                  },
                  onError: (error) =>
                    onMessage(error instanceof Error ? error.message : "Update failed"),
                },
              )
            }
            className="h-9 rounded-md bg-fg px-3 text-xs font-medium text-app disabled:opacity-50"
          >
            Save account
          </button>
        </div>
      )}
    </section>
  );
}
