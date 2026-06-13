const KEY = "typed-search-overlay-query";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readSearchOverlayQuery(): string {
  if (!canUseStorage()) return "";
  return window.localStorage.getItem(KEY) ?? "";
}

export function writeSearchOverlayQuery(value: string): void {
  if (!canUseStorage()) return;
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    window.localStorage.removeItem(KEY);
    return;
  }
  window.localStorage.setItem(KEY, trimmed);
}

export function resolveInitialSearchOverlayQuery(pathname: string, searchStr: string): string {
  if (pathname === "/search") {
    const q = new URLSearchParams(searchStr).get("q") ?? "";
    if (q.trim().length > 0) return q.trim();
  }
  return readSearchOverlayQuery();
}
