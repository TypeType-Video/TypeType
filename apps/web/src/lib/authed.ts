import { useAuthStore } from "../stores/auth-store";
import { ApiError } from "./api";
import { recordApiError } from "./api-error-log";
import { refreshSession } from "./auth-session";
import { extractRequestId, recordClientEvent } from "./client-debug-log";
import { sanitizeDebugText, sanitizeRequestPath } from "./debug-sanitize";
import { normalizeApiPayload } from "./text-normalize";

function withBearer(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}

type AuthedOptions = {
  silentStatuses?: number[];
};

function shouldLogStatus(status: number, options: AuthedOptions | undefined): boolean {
  return !(options?.silentStatuses ?? []).includes(status);
}

export async function authed(
  url: string,
  init?: RequestInit,
  options?: AuthedOptions,
): Promise<Response> {
  const method = init?.method ?? "GET";
  const path = sanitizeRequestPath(url);
  let token = useAuthStore.getState().token;
  if (!token) {
    recordClientEvent("auth.missing_token_try_refresh", { method, path });
    try {
      token = await refreshSession();
    } catch {
      useAuthStore.getState().setSignedOut();
      recordApiError({
        endpoint: url,
        status: 401,
        code: "AUTH_REQUIRED",
        message: "Authentication required",
      });
      throw new ApiError("Authentication required", 401);
    }
  }
  let res: Response;
  try {
    res = await fetch(url, withBearer(init, token));
  } catch (error) {
    const message = error instanceof Error ? error.message : "network_error";
    recordApiError({
      endpoint: url,
      status: 520,
      code: "NETWORK_ERROR",
      message,
    });
    recordClientEvent("auth.network_error", {
      method,
      path,
      message: sanitizeDebugText(message),
    });
    throw error;
  }
  if (res.status === 401) {
    recordClientEvent("auth.unauthorized_retry", { method, path });
    try {
      const retryToken = await refreshSession();
      const retryRes = await fetch(url, withBearer(init, retryToken));
      if (!retryRes.ok && shouldLogStatus(retryRes.status, options)) {
        recordApiError({
          endpoint: url,
          status: retryRes.status,
          code: "AUTH_RETRY_ERROR",
          message: "Retry request failed",
          requestId: extractRequestId(retryRes.headers),
        });
        recordClientEvent("auth.retry_error", {
          method,
          path,
          status: retryRes.status,
          requestId: extractRequestId(retryRes.headers),
        });
      }
      return retryRes;
    } catch {
      useAuthStore.getState().setSignedOut();
      recordApiError({
        endpoint: url,
        status: 401,
        code: "SESSION_EXPIRED",
        message: "Session expired",
      });
      recordClientEvent("auth.session_expired", { method, path });
      throw new ApiError("Session expired", 401);
    }
  }
  if (!res.ok && shouldLogStatus(res.status, options)) {
    recordApiError({
      endpoint: url,
      status: res.status,
      code: "AUTH_RESPONSE_ERROR",
      message: "Authed request failed",
      requestId: extractRequestId(res.headers),
    });
    recordClientEvent("auth.response_error", {
      method,
      path,
      status: res.status,
      requestId: extractRequestId(res.headers),
    });
  }
  return res;
}

export async function authedJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await authed(url, init);
  const body = normalizeApiPayload(await res.json());
  if (!res.ok) throw new ApiError((body as { error: string }).error, res.status);
  return body as T;
}
