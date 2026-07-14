import { ApiError, request } from "./api";
import { API_BASE as BASE } from "./env";

export type InstanceCapabilities = {
  guestAllowed: boolean;
  youtubeRemoteLoginEnabled: boolean;
};

function isInstanceCapabilities(value: unknown): value is InstanceCapabilities {
  return (
    !!value &&
    typeof value === "object" &&
    "guestAllowed" in value &&
    typeof value.guestAllowed === "boolean" &&
    "youtubeRemoteLoginEnabled" in value &&
    typeof value.youtubeRemoteLoginEnabled === "boolean"
  );
}

export async function fetchInstanceCapabilities(): Promise<InstanceCapabilities> {
  const payload = await request<unknown>(`${BASE}/instance`);
  if (!isInstanceCapabilities(payload)) throw new ApiError("Invalid instance payload", 500);
  return payload;
}
