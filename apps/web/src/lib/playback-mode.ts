export type PlaybackMode = "legacy" | "sabr";

const STORAGE_KEY = "typed-playback-mode";
const CHANGE_EVENT = "typed:playback-mode-change";
const CLASSIC_REQUEST_EVENT = "typed:classic-playback-request";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isPlaybackMode(value: string | null): value is PlaybackMode {
  return value === "legacy" || value === "sabr";
}

export function readPlaybackMode(): PlaybackMode {
  if (!canUseStorage()) return "legacy";
  return resolveStoredPlaybackMode(window.localStorage.getItem(STORAGE_KEY));
}

export function resolveStoredPlaybackMode(stored: string | null): PlaybackMode {
  if (stored === "adaptive") return "sabr";
  if (stored === "ios-legacy-compat") return "legacy";
  return isPlaybackMode(stored) ? stored : "sabr";
}

export function setPlaybackMode(mode: PlaybackMode): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, mode);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function requestPlaybackMode(mode: PlaybackMode): void {
  if (mode === "legacy" && typeof window !== "undefined") {
    window.dispatchEvent(new Event(CLASSIC_REQUEST_EVENT));
    return;
  }
  setPlaybackMode(mode);
}

export function subscribeClassicPlaybackRequest(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CLASSIC_REQUEST_EVENT, listener);
  return () => window.removeEventListener(CLASSIC_REQUEST_EVENT, listener);
}

export function subscribePlaybackMode(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    listener();
  };
  const onChange = () => listener();

  window.addEventListener("storage", onStorage);
  window.addEventListener(CHANGE_EVENT, onChange);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
