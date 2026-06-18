import type { AdminSettings } from "../types/admin";
import type { AuthRole, AuthUser, PasswordResetToken } from "../types/auth";
import { ApiError } from "./api";
import { authed, authedJson } from "./authed";
import { API_BASE as BASE } from "./env";

type AdminUsersPage = {
  items: AuthUser[];
  page: number;
  limit: number;
  total: number;
};

function isAdminSettings(value: unknown): value is AdminSettings {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<AdminSettings>;
  return (
    typeof record.name === "string" &&
    (record.tagline === null || typeof record.tagline === "string") &&
    (record.logoUrl === null || typeof record.logoUrl === "string") &&
    (record.bannerUrl === null || typeof record.bannerUrl === "string") &&
    (record.minAndroidClientVersion === null ||
      typeof record.minAndroidClientVersion === "string") &&
    typeof record.allowRegistration === "boolean" &&
    typeof record.allowGuest === "boolean" &&
    typeof record.forceEmailVerification === "boolean" &&
    typeof record.activeSessionsEnabled === "boolean" &&
    typeof record.localLoginEnabled === "boolean" &&
    typeof record.oidcAutoRedirect === "boolean" &&
    typeof record.youtubeRemoteLoginEnabled === "boolean"
  );
}

function normalizeAdminUser(user: AuthUser): AuthUser {
  return {
    ...user,
    publicUsername: user.publicUsername ?? null,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? null,
    avatarType: user.avatarType ?? null,
    avatarCode: user.avatarCode ?? null,
  };
}

function isPaginatedResponse(value: unknown): value is AdminUsersPage {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<AdminUsersPage>;
  return (
    Array.isArray(record.items) &&
    typeof record.page === "number" &&
    typeof record.limit === "number" &&
    typeof record.total === "number"
  );
}

function toNumberParam(value: number): string {
  return String(Math.trunc(value));
}

export async function fetchAdminUsers(page: number, limit: number): Promise<AdminUsersPage> {
  const search = new URLSearchParams({
    page: toNumberParam(page),
    limit: toNumberParam(limit),
  });
  try {
    const res = await authedJson<AdminUsersPage>(`${BASE}/admin/users?${search}`);
    if (!isPaginatedResponse(res)) {
      throw new ApiError("Invalid admin users payload", 500);
    }
    return {
      ...res,
      items: res.items.map(normalizeAdminUser),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      throw new ApiError("Insufficient role", 403);
    }
    throw error;
  }
}

export async function updateUserRole(id: string, role: AuthRole): Promise<void> {
  const res = await authed(`${BASE}/admin/users/${encodeURIComponent(id)}/role`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (res.status !== 204) {
    const errorBody = (await res.json().catch(() => ({
      error: "Failed to update role",
    }))) as Partial<{ error: string }>;
    throw new ApiError(errorBody.error ?? "Failed to update role", res.status);
  }
}

export async function suspendUser(id: string): Promise<void> {
  const res = await authed(`${BASE}/admin/users/${encodeURIComponent(id)}/suspend`, {
    method: "POST",
  });
  if (res.status !== 204) {
    const errorBody = (await res.json().catch(() => ({
      error: "Failed to suspend user",
    }))) as Partial<{ error: string }>;
    throw new ApiError(errorBody.error ?? "Failed to suspend user", res.status);
  }
}

export async function unsuspendUser(id: string): Promise<void> {
  const res = await authed(`${BASE}/admin/users/${encodeURIComponent(id)}/suspend`, {
    method: "DELETE",
  });
  if (res.status !== 204) {
    const errorBody = (await res.json().catch(() => ({
      error: "Failed to unsuspend user",
    }))) as Partial<{ error: string }>;
    throw new ApiError(errorBody.error ?? "Failed to unsuspend user", res.status);
  }
}

export async function createPasswordResetToken(id: string): Promise<PasswordResetToken> {
  const res = await authed(`${BASE}/admin/users/${encodeURIComponent(id)}/reset-token`, {
    method: "POST",
  });
  const body = (await res.json().catch(() => ({ resetToken: "" }))) as Partial<PasswordResetToken>;
  if (res.status !== 201 || typeof body.resetToken !== "string" || body.resetToken.length === 0) {
    throw new ApiError("Failed to create reset token", res.status);
  }
  return { resetToken: body.resetToken };
}

export async function fetchAdminSettings(): Promise<AdminSettings> {
  const payload = await authedJson<unknown>(`${BASE}/admin/settings`);
  if (!isAdminSettings(payload)) throw new ApiError("Invalid admin settings payload", 500);
  return payload;
}

export async function updateAdminSettings(settings: AdminSettings): Promise<AdminSettings> {
  const res = await authed(`${BASE}/admin/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError("Failed to update admin settings", res.status);
  if (body === null && (res.status === 200 || res.status === 204)) return settings;
  if (!isAdminSettings(body)) throw new ApiError("Failed to update admin settings", res.status);
  return body;
}
