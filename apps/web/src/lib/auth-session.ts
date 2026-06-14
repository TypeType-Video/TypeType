import { useAuthStore } from "../stores/auth-store";
import type { AuthMe } from "../types/auth";
import { ApiError } from "./api";
import { fetchMe, loginAuth, logoutAuth, refreshAuth, registerAuth } from "./api-auth";
import { completeOidc } from "./api-oidc";

type Credentials = {
  identifier: string;
  password: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

let refreshInFlight: Promise<string> | null = null;

async function hydrateSession(token: string): Promise<AuthMe> {
  const me = await fetchMe(token);
  useAuthStore.getState().setSession(token, me);
  return me;
}

async function runRefreshSession(): Promise<string> {
  const refreshed = await refreshAuth();
  await hydrateSession(refreshed.accessToken);
  return refreshed.accessToken;
}

export async function refreshSession(): Promise<string> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = runRefreshSession().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

export async function bootstrapSession(): Promise<void> {
  const { token, me, setBootstrapping, setSession, setSignedOut } = useAuthStore.getState();
  if (!token) return;
  setBootstrapping();
  try {
    await hydrateSession(token);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      try {
        await refreshSession();
        return;
      } catch {
        setSignedOut();
        return;
      }
    }
    if (me) {
      setSession(token, me);
      return;
    }
    setSignedOut();
  }
}

export async function loginSession(payload: Credentials): Promise<void> {
  const response = await loginAuth(payload);
  await hydrateSession(response.accessToken);
}

export async function registerSession(payload: RegisterPayload): Promise<void> {
  const response = await registerAuth(payload);
  await hydrateSession(response.accessToken);
}

export async function oidcCallbackSession(payload: {
  code: string;
  state: string;
  redirectUri: string;
}): Promise<string> {
  const result = await completeOidc(payload);
  await hydrateSession(result.accessToken);
  return result.returnTo;
}

export async function logoutSession(): Promise<void> {
  try {
    await logoutAuth();
  } catch {
    useAuthStore.getState().setSignedOut();
    return;
  }
  useAuthStore.getState().setSignedOut();
}
