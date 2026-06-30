const STORAGE_KEY = "typed-skip-playlist-autoplay-screen";
const CHANGE_EVENT = "typed:skip-playlist-autoplay-screen-change";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readSkipPlaylistAutoplayScreen(): boolean {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(STORAGE_KEY) === "true";
}

export function setSkipPlaylistAutoplayScreen(enabled: boolean): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, String(enabled));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeSkipPlaylistAutoplayScreen(listener: () => void): () => void {
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
