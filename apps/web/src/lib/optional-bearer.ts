import { useAuthStore } from "../stores/auth-store";

export function optionalBearer(init?: RequestInit): RequestInit | undefined {
  const token = useAuthStore.getState().token;
  if (!token) return init;
  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}
