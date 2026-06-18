import type { CrashLogEntry } from "../types/bug-report";
import { debugConsole, sanitizeDebugEvent } from "./debug-console";
import { sanitizeDebugText } from "./debug-sanitize";

const STORAGE_KEY = "typed-client-debug-log";
const MAX_ENTRIES = 80;
const TTL_MS = 30 * 60 * 1000;
const REQUEST_ID_HEADERS = ["x-request-id", "x-correlation-id", "x-trace-id", "request-id"];

type StoredLog = {
  updatedAt: number;
  entries: CrashLogEntry[];
};

type DebugDetails = Record<string, string | number | boolean | null | undefined>;

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function isCrashLogEntry(value: unknown): value is CrashLogEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.message === "string" &&
    (typeof entry.stack === "string" || entry.stack === null) &&
    typeof entry.timestamp === "number"
  );
}

function readStoredLog(): StoredLog {
  if (!canUseSessionStorage()) return { updatedAt: Date.now(), entries: [] };
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return { updatedAt: Date.now(), entries: [] };
  try {
    const parsed = JSON.parse(raw) as { updatedAt?: unknown; entries?: unknown };
    const updatedAt = typeof parsed.updatedAt === "number" ? parsed.updatedAt : 0;
    if (Date.now() - updatedAt > TTL_MS) return { updatedAt: Date.now(), entries: [] };
    const entries = Array.isArray(parsed.entries)
      ? parsed.entries.filter(isCrashLogEntry).map((entry) => ({
          message: sanitizeDebugText(entry.message),
          stack: entry.stack ? sanitizeDebugText(entry.stack) : null,
          timestamp: entry.timestamp,
        }))
      : [];
    return { updatedAt, entries };
  } catch {
    return { updatedAt: Date.now(), entries: [] };
  }
}

function writeStoredLog(entries: CrashLogEntry[]): void {
  if (!canUseSessionStorage()) return;
  const payload: StoredLog = { updatedAt: Date.now(), entries };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function pushEntry(entry: CrashLogEntry): void {
  const stored = readStoredLog();
  writeStoredLog([...stored.entries, entry].slice(-MAX_ENTRIES));
}

function formatDetails(details: DebugDetails | undefined): string {
  if (!details) return "";
  const parts: string[] = [];
  for (const [key, value] of Object.entries(details)) {
    if (value === undefined) continue;
    parts.push(`${key}=${sanitizeDebugText(String(value))}`);
  }
  return parts.join(" ");
}

export function recordClientEvent(
  event: string,
  details?: DebugDetails,
  stack?: string | null,
): void {
  debugConsole(event, details);
  const detailText = formatDetails(details);
  const eventName = sanitizeDebugEvent(event);
  const message = detailText.length > 0 ? `${eventName} ${detailText}` : eventName;
  pushEntry({ message, stack: stack ? sanitizeDebugText(stack) : null, timestamp: Date.now() });
}

export function recordCrashLog(message: string, stack: string | null): void {
  pushEntry({
    message: sanitizeDebugText(message),
    stack: stack ? sanitizeDebugText(stack) : null,
    timestamp: Date.now(),
  });
}

export function getClientDebugLogs(): CrashLogEntry[] {
  return readStoredLog().entries;
}

export function clearClientDebugLogs(): void {
  writeStoredLog([]);
}

export function extractRequestId(headers: Headers): string | null {
  for (const headerName of REQUEST_ID_HEADERS) {
    const value = headers.get(headerName);
    if (value && value.trim().length > 0) return sanitizeDebugText(value);
  }
  return null;
}
