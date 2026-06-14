import { useState } from "react";
import { startOidc } from "../lib/api-oidc";
import { oidcCallbackUrl } from "../lib/oidc-redirect";
import { ProviderBrandIcon } from "./provider-brand-icon";

type Props = {
  providerName: string | null;
  returnTo?: string;
};

export function OidcSignInButton({ providerName, returnTo }: Props) {
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function start() {
    setPending(true);
    setFailed(false);
    try {
      const { authorizationUrl } = await startOidc(oidcCallbackUrl(), returnTo);
      window.location.assign(authorizationUrl);
    } catch {
      setFailed(true);
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={start}
        disabled={pending}
        className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface-strong text-sm font-medium text-fg transition-colors hover:bg-surface-soft disabled:opacity-60"
      >
        {pending ? (
          "Redirecting..."
        ) : (
          <>
            <ProviderBrandIcon providerName={providerName} />
            <span>Continue with {providerName ?? "SSO"}</span>
          </>
        )}
      </button>
      {failed && <p className="text-xs text-danger">Could not start sign-in. Try again.</p>}
    </div>
  );
}
