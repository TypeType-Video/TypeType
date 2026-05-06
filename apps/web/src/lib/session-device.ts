import type { SessionDevicePayload } from "./api-admin-sessions";

const DEVICE_ID_KEY = "typetype-device-id";

function createDeviceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function readDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
    const next = createDeviceId();
    localStorage.setItem(DEVICE_ID_KEY, next);
    return next;
  } catch {
    return createDeviceId();
  }
}

function detectDeviceType(): string {
  if (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) return "mobile";
  return "desktop";
}

function detectDeviceName(): string {
  if (typeof navigator === "undefined") return "Browser";
  const ua = navigator.userAgent;
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Safari/")) return "Safari";
  return "Browser";
}

export function getSessionDevicePayload(): SessionDevicePayload {
  return {
    clientName: "web",
    clientVersion: import.meta.env.PROD ? "prod" : "dev",
    deviceId: readDeviceId(),
    deviceName: detectDeviceName(),
    deviceType: detectDeviceType(),
  };
}
