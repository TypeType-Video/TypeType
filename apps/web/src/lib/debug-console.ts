import { sanitizeDebugText } from "./debug-sanitize";

type DebugDetails = Record<string, string | number | boolean | null | undefined>;

function enabled(): boolean {
  if (import.meta.env.DEV) return true;
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("typetype-debug-console") === "1";
}

function sanitizeDetails(details: DebugDetails | undefined): DebugDetails | undefined {
  if (!details) return undefined;
  const next: DebugDetails = {};
  for (const [key, value] of Object.entries(details)) {
    next[key] = typeof value === "string" ? sanitizeDebugText(value) : value;
  }
  return next;
}

export function sanitizeDebugEvent(value: string): string {
  const normalized = value.replace(/[^a-z0-9_.:-]/gi, "_");
  return normalized.length > 80 ? `${normalized.slice(0, 77)}...` : normalized;
}

export function debugConsole(event: string, details?: DebugDetails): void {
  if (!enabled()) return;
  console.info(`[typetype] ${sanitizeDebugEvent(event)}`, sanitizeDetails(details) ?? "");
}
