import { ApiError } from "./api";

export const FAMILY_LIST_BLOCKED_MESSAGE =
  "This channel is not on your family list. A parent can add it from the allow list.";

export function isChannelNotAllowedError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.status === 403 &&
    error.message.toLowerCase().includes("channel is not allowed")
  );
}
