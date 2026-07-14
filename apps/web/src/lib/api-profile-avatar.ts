import { ApiError } from "./api";
import { authed } from "./authed";
import { API_BASE as BASE } from "./env";

type SetEmojiAvatarPayload = {
  code: string;
};

export type CustomAvatarItem = {
  avatarUrl: string;
  mediaType: string;
  size: number;
};

export async function setEmojiAvatar(payload: SetEmojiAvatarPayload): Promise<void> {
  const res = await authed(`${BASE}/profile/avatar/emoji`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status !== 204) throw new ApiError("Failed to set emoji avatar", res.status);
}

export async function clearAvatar(): Promise<void> {
  const res = await authed(`${BASE}/profile/avatar`, { method: "DELETE" });
  if (res.status !== 204) throw new ApiError("Failed to clear avatar", res.status);
}

export async function uploadCustomAvatar(file: File): Promise<CustomAvatarItem> {
  const res = await authed(`${BASE}/profile/avatar/custom`, {
    method: "PUT",
    headers: { "Content-Type": file.type || "application/octet-stream" },
    body: file,
  });
  const body = await res.json().catch(() => null);
  if (
    !res.ok ||
    !body ||
    typeof body !== "object" ||
    !("avatarUrl" in body) ||
    !("mediaType" in body) ||
    typeof body.avatarUrl !== "string" ||
    typeof body.mediaType !== "string"
  ) {
    throw new ApiError("Failed to upload avatar", res.status);
  }
  const size = "size" in body && typeof body.size === "number" ? body.size : file.size;
  return { avatarUrl: body.avatarUrl, mediaType: body.mediaType, size };
}
