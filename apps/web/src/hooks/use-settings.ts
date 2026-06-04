import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateSettings } from "../lib/api-user";
import type { SettingsItem } from "../types/user";
import { useAuth } from "./use-auth";

const KEY = ["settings"];

const DEFAULTS: SettingsItem = {
  defaultService: 0,
  defaultQuality: "1080p",
  autoplay: true,
  volume: 1,
  muted: false,
  subtitlesEnabled: false,
  defaultSubtitleLanguage: "",
  defaultAudioLanguage: "",
  preferOriginalLanguage: true,
  enableHighQualityPlayback: false,
};

export function useSettings() {
  const qc = useQueryClient();
  const { authReady, isAuthed } = useAuth();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => fetchSettings(),
    enabled: authReady && isAuthed,
    placeholderData: DEFAULTS,
  });
  const settingsReady =
    (authReady && !isAuthed) || (query.isSuccess && !query.isPlaceholderData) || query.isError;

  const update = useMutation({
    mutationFn: (patch: Partial<SettingsItem>) => {
      const current = qc.getQueryData<SettingsItem>(KEY) ?? DEFAULTS;
      const next = { ...current, ...patch };
      if (!isAuthed) return Promise.resolve(next);
      return updateSettings(next);
    },
    onSuccess: (data) => {
      qc.setQueryData(KEY, data);
    },
    onError: (err) => {
      console.error("[settings] PUT failed", err);
    },
  });

  return { query, update, settings: query.data ?? DEFAULTS, settingsReady };
}
