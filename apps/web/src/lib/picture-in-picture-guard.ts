import { recordClientEvent } from "./client-debug-log";

export function guardVidstackPictureInPicture(): void {
  if (typeof document === "undefined" || !document.pictureInPictureEnabled) return;
  try {
    Object.defineProperty(document, "pictureInPictureEnabled", {
      configurable: true,
      get: () => false,
    });
  } catch (error) {
    recordClientEvent("player.pip_guard_failed", {
      message: error instanceof Error ? error.message : "unknown",
    });
  }
}
