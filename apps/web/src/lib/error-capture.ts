import type { CrashLogEntry } from "../types/bug-report";
import {
  clearClientDebugLogs,
  getClientDebugLogs,
  recordClientEvent,
  recordCrashLog,
} from "./client-debug-log";

function handleError(event: ErrorEvent): void {
  recordClientEvent("debug.window_error", { message: event.message });
  recordCrashLog(event.message, event.error?.stack ?? null);
}

function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  const reason = event.reason;
  const message = reason instanceof Error ? reason.message : String(reason ?? "Unknown");
  const stack = reason instanceof Error ? (reason.stack ?? null) : null;
  recordClientEvent("debug.unhandled_rejection", { message });
  recordCrashLog(`Unhandled Promise Rejection: ${message}`, stack);
}

let initialized = false;

export function initErrorCapture(): void {
  if (initialized) return;
  initialized = true;
  recordClientEvent("debug.capture_started");

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);
}

export function getCrashLogs(): CrashLogEntry[] {
  return getClientDebugLogs();
}

export function clearCrashLogs(): void {
  clearClientDebugLogs();
}
