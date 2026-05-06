import { useEffect } from "react";
import { reportSessionActivity } from "../lib/api-admin-sessions";
import { getSessionDevicePayload } from "../lib/session-device";
import { useAuth } from "./use-auth";

const ACTIVITY_INTERVAL_MS = 60_000;

export function useSessionActivityReporting() {
  const { status } = useAuth();
  const enabled = status === "authenticated";

  useEffect(() => {
    if (!enabled) return;

    const report = () => {
      void reportSessionActivity(getSessionDevicePayload()).catch(() => {});
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") report();
    };

    report();
    const interval = setInterval(report, ACTIVITY_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled]);
}
