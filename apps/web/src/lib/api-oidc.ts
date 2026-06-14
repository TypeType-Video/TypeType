import type { OidcStatus } from "../types/auth";
import { request } from "./api";
import { API_BASE as BASE } from "./env";

export type OidcStartResult = {
  authorizationUrl: string;
};

export type OidcCallbackResult = {
  accessToken: string;
  returnTo: string;
};

export function fetchOidcStatus(): Promise<OidcStatus> {
  return request(`${BASE}/auth/oidc/status`);
}

export function startOidc(redirectUri: string, returnTo?: string): Promise<OidcStartResult> {
  const params = new URLSearchParams({ redirectUri });
  if (returnTo) params.set("returnTo", returnTo);
  return request(`${BASE}/auth/oidc/start?${params}`);
}

export function completeOidc(payload: {
  code: string;
  state: string;
  redirectUri: string;
}): Promise<OidcCallbackResult> {
  return request(`${BASE}/auth/oidc/callback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
}
