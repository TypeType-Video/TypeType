import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { updateAdminIdentity } from "../lib/api-account-identity";
import type { AuthUser } from "../types/auth";

type Props = {
  user: AuthUser;
  disabled: boolean;
  onMessage: (message: string) => void;
};

export function AdminUserIdentityForm({ user, disabled, onMessage }: Props) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const update = useMutation({
    mutationFn: () => updateAdminIdentity(user.id, { email: email.trim(), name: name.trim() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
  });

  useEffect(() => {
    setEmail(user.email);
    setName(user.name);
  }, [user]);

  const dirty =
    email.trim().toLowerCase() !== user.email.toLowerCase() || name.trim() !== user.name;
  return (
    <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
      <input
        value={name}
        aria-label="Display name"
        onChange={(event) => setName(event.target.value)}
        className="h-8 rounded-md border border-border-strong bg-app px-2.5 text-xs text-fg"
      />
      <input
        type="email"
        value={email}
        aria-label="Email address"
        onChange={(event) => setEmail(event.target.value)}
        className="h-8 rounded-md border border-border-strong bg-app px-2.5 text-xs text-fg"
      />
      <button
        type="button"
        disabled={disabled || update.isPending || !dirty}
        onClick={() =>
          update.mutate(undefined, {
            onSuccess: () => onMessage("User identity updated"),
            onError: (error) => onMessage(error instanceof Error ? error.message : "Update failed"),
          })
        }
        className="h-8 rounded-md border border-border-strong bg-surface text-xs text-fg disabled:opacity-50"
      >
        Save identity
      </button>
    </div>
  );
}
