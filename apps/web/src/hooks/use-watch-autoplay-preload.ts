import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { prewarmSabrPlayback } from "../lib/api-sabr-prewarm";
import { shouldPreloadAutoplayTarget } from "../lib/autoplay-preload";
import { defaultSabrItag, resolveSabrPlaybackConfig, sabrQualityOptions } from "../lib/sabr-source";
import { toWatchSourceUrl } from "../lib/watch-url";
import { useAuthStore } from "../stores/auth-store";
import { useAuth } from "./use-auth";
import { useInstance } from "./use-instance";
import { useSettings } from "./use-settings";
import { streamQueryOptions } from "./use-stream";
import type { AutoplayTarget } from "./use-watch-ended-navigation";

type Args = {
  durationMs: number;
  enabled: boolean;
  target: AutoplayTarget | null;
};

export function useWatchAutoplayPreload({ durationMs, enabled, target }: Args) {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const { authReady, isAuthed } = useAuth();
  const { data: instance, isPending: instancePending } = useInstance();
  const { settings, settingsReady } = useSettings();
  const preloadedRef = useRef(new Set<string>());
  const activeRef = useRef<AbortController | null>(null);
  const activeTargetIdRef = useRef("");
  const useAuthenticatedStream =
    isAuthed && (settings.accessMode === "allow_list" || instance?.guestAllowed === false);
  const ready = authReady && !instancePending && (!isAuthed || settingsReady);
  const targetId = target?.id ?? "";

  useEffect(() => {
    if (activeTargetIdRef.current === targetId) return;
    activeTargetIdRef.current = targetId;
    activeRef.current?.abort();
    activeRef.current = null;
  }, [targetId]);

  useEffect(
    () => () => {
      activeRef.current?.abort();
    },
    [],
  );

  return useCallback(
    (positionMs: number) => {
      if (!shouldPreloadAutoplayTarget(positionMs, durationMs, enabled, Boolean(target))) return;
      if (!target || !ready) return;
      const sourceUrl = toWatchSourceUrl(target.search.v);
      const key = `${sourceUrl}:${useAuthenticatedStream ? "auth" : "anon"}`;
      if (preloadedRef.current.has(key)) return;
      preloadedRef.current.add(key);
      const controller = new AbortController();
      activeRef.current?.abort();
      activeRef.current = controller;
      void queryClient
        .fetchQuery(streamQueryOptions(sourceUrl, useAuthenticatedStream))
        .then((stream) => {
          if (controller.signal.aborted) return;
          const itag = defaultSabrItag(sabrQualityOptions(stream), "720p");
          const config = resolveSabrPlaybackConfig(stream, itag);
          if (config) return prewarmSabrPlayback(config, token, controller.signal);
        })
        .catch(() => {
          if (!controller.signal.aborted) preloadedRef.current.delete(key);
        })
        .finally(() => {
          if (activeRef.current === controller) activeRef.current = null;
        });
    },
    [durationMs, enabled, queryClient, ready, target, token, useAuthenticatedStream],
  );
}
