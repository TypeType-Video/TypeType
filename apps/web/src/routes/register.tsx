import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthCard } from "../components/auth-card";
import { AuthErrorBanner } from "../components/auth-error-banner";
import { OidcSignInButton } from "../components/oidc-sign-in-button";
import { Toast } from "../components/toast";
import { useAuth } from "../hooks/use-auth";
import { useOidcStatus } from "../hooks/use-oidc-status";
import { useRegisterStatus } from "../hooks/use-register-status";
import { ApiError } from "../lib/api";
import { sanitizeRedirect } from "../lib/auth-routes";
import { registerSession } from "../lib/auth-session";
import { goto } from "../lib/route-redirect";

function RegisterPage() {
  const { isAuthed, isGuest } = useAuth();
  const { redirect } = Route.useSearch();
  const target = sanitizeRedirect(redirect);
  const registerStatus = useRegisterStatus();
  const status = registerStatus.data;
  const { data: oidc } = useOidcStatus();
  const oidcEnabled = oidc?.enabled ?? false;
  const localEnabled = oidc?.localLoginEnabled ?? true;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const postAuthTarget = redirect ? target : "/import";

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const closedByPolicy = status ? !status.allowRegistration && !status.bootstrapAvailable : false;
  const subtitle = !localEnabled
    ? "Local registration is disabled."
    : status?.bootstrapAvailable
      ? "Fresh install detected. The first account will be admin."
      : closedByPolicy
        ? "Registrations are currently closed."
        : "Use your email to create an account. You can sign in with email or username.";
  const bannerMessage = error ?? (closedByPolicy ? "Registrations are currently closed." : null);

  if (isAuthed && !isGuest) {
    goto(postAuthTarget);
    return null;
  }

  async function submitRegister(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      await registerSession({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      setToast("Account created");
      goto(postAuthTarget);
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        setError("Registrations are currently closed.");
      } else {
        setError("Unable to create account.");
      }
    }
    setPending(false);
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <Toast message={toast} />
      <AuthCard title="Create account" subtitle={subtitle}>
        <AuthErrorBanner message={bannerMessage} />
        {oidcEnabled && (
          <div className="mb-4">
            <OidcSignInButton providerName={oidc?.providerName ?? null} returnTo={redirect} />
          </div>
        )}
        {oidcEnabled && localEnabled && (
          <div className="mb-4 flex items-center gap-3 text-[11px] uppercase tracking-wider text-fg-soft">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
        )}
        {!localEnabled && !oidcEnabled && (
          <p className="text-sm text-fg-muted">Local registration is disabled.</p>
        )}
        {localEnabled && (
          <form className="flex flex-col gap-3" onSubmit={submitRegister}>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="h-10 rounded-lg border border-border-strong bg-app px-3 text-sm text-fg"
              required
            />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="h-10 rounded-lg border border-border-strong bg-app px-3 text-sm text-fg"
              required
            />
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-10 rounded-lg border border-border-strong bg-app px-3 text-sm text-fg"
              required
            />
            <button
              type="submit"
              disabled={pending || closedByPolicy}
              className="h-10 rounded-lg bg-fg text-app text-sm font-medium disabled:opacity-60"
            >
              {closedByPolicy
                ? "Registrations closed"
                : pending
                  ? "Creating account..."
                  : "Register"}
            </button>
          </form>
        )}
        <div className="mt-4 text-xs text-fg-soft">
          <Link to="/login" search={{ redirect }} className="hover:text-fg-muted">
            Already have an account? Sign in
          </Link>
        </div>
      </AuthCard>
    </div>
  );
}

export const Route = createFileRoute("/register")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: RegisterPage,
});
