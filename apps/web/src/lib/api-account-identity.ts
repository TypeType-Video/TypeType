import { ApiError } from "./api";
import { authed, authedJson } from "./authed";
import { API_BASE as BASE } from "./env";

export type AccountIdentity = {
  email: string;
  name: string;
  managedByOidc: boolean;
};

export type AccountIdentityUpdate = {
  email: string;
  name: string;
  currentPassword: string;
};

export function fetchAccountIdentity(): Promise<AccountIdentity> {
  return authedJson(`${BASE}/profile/account`);
}

export async function updateAccountIdentity(payload: AccountIdentityUpdate): Promise<void> {
  const response = await authed(`${BASE}/profile/account`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response.status === 204) return;
  const body = await response.json().catch(() => null);
  const message =
    body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error
      : "Unable to update account";
  throw new ApiError(message, response.status);
}

export async function updateAdminIdentity(
  userId: string,
  payload: Pick<AccountIdentityUpdate, "email" | "name">,
): Promise<void> {
  const response = await authed(`${BASE}/admin/users/${encodeURIComponent(userId)}/identity`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (response.status === 204) return;
  throw new ApiError("Unable to update user identity", response.status);
}
