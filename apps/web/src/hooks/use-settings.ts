import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchSettings, updateSettings } from "../lib/api-user";
import { EMPTY_CAPTION_STYLES } from "../lib/caption-styles";
import { DEFAULT_SPONSORBLOCK_CATEGORY_ACTIONS } from "../lib/sponsorblock-settings";
import type { SettingsItem } from "../types/user";
import { useAuth } from "./use-auth";

const KEY = ["settings"];
const AUDIO_ONLY_STORAGE_KEY = "typetype-audio-only-playback";

const DEFAULTS: SettingsItem = {
  defaultService: 0,
  defaultLandingPage: "home",
  defaultQuality: "1080p",
  autoplay: true,
  autoplayCountdownSeconds: 10,
  skipPlaylistAutoplayScreen: false,
  audioOnlyPlayback: false,
  volume: 1,
  muted: false,
  subtitlesEnabled: false,
  defaultSubtitleLanguage: "",
  defaultAudioLanguage: "",
  preferOriginalLanguage: true,
  enableHighQualityPlayback: true,
  sponsorBlockMode: "auto_skip",
  sponsorBlockCategoryActions: DEFAULT_SPONSORBLOCK_CATEGORY_ACTIONS,
  sponsorBlockMinimumDuration: 0,
  sponsorBlockShowCurrentSegment: true,
  sponsorBlockShowChapters: false,
  sponsorBlockShowFullVideoLabels: true,
  sponsorBlockManualSkipOnFullVideo: true,
  sponsorBlockSkipNonMusicOnlyOnMusicVideos: false,
  sponsorBlockMuteInsteadOfSkip: false,
  disableWatchHistory: false,
  deArrowEnabled: false,
  deArrowTitleMode: "dearrow",
  deArrowThumbnailMode: "dearrow_or_random",
  deArrowTrustMode: "accepted",
  hideContinueWatching: false,
  hideHomeRecommendations: false,
  hideRelatedVideos: false,
  hideComments: false,
  hideShorts: false,
  accessMode: "unrestricted",
  captionStyles: EMPTY_CAPTION_STYLES,
};

function readAudioOnlyPlayback(): boolean | null {
  const stored = localStorage.getItem(AUDIO_ONLY_STORAGE_KEY);
  if (stored === "true") return true;
  if (stored === "false") return false;
  return null;
}

function writeAudioOnlyPlayback(value: boolean): void {
  localStorage.setItem(AUDIO_ONLY_STORAGE_KEY, String(value));
}

function withLocalAudioOnly(settings: SettingsItem): SettingsItem {
  const audioOnlyPlayback = readAudioOnlyPlayback();
  return audioOnlyPlayback === null ? settings : { ...settings, audioOnlyPlayback };
}

export function useSettings() {
  const qc = useQueryClient();
  const { authReady, isAuthed } = useAuth();

  const query = useQuery({
    queryKey: KEY,
    queryFn: () => fetchSettings(),
    enabled: authReady && isAuthed,
    placeholderData: DEFAULTS,
    staleTime: 5 * 60 * 1000,
  });
  const settingsReady =
    (authReady && !isAuthed) || (query.isSuccess && !query.isPlaceholderData) || query.isError;

  const update = useMutation({
    mutationFn: (patch: Partial<SettingsItem>) => {
      const stored = qc.getQueryData<SettingsItem>(KEY);
      const current = stored ? { ...DEFAULTS, ...stored } : DEFAULTS;
      const next = { ...current, ...patch };
      if (!isAuthed) return Promise.resolve(next);
      return updateSettings(next);
    },
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: KEY });
      if (typeof patch.audioOnlyPlayback === "boolean")
        writeAudioOnlyPlayback(patch.audioOnlyPlayback);
      const previous = qc.getQueryData<SettingsItem>(KEY);
      qc.setQueryData<SettingsItem>(KEY, { ...DEFAULTS, ...previous, ...patch });
      return { previous, patch };
    },
    onSuccess: (data, _patch, context) => {
      const current = qc.getQueryData<SettingsItem>(KEY);
      qc.setQueryData(KEY, { ...DEFAULTS, ...current, ...data, ...context?.patch });
    },
    onError: (err, _patch, context) => {
      if (context?.previous) qc.setQueryData(KEY, context.previous);
      console.error("[settings] PUT failed", err);
    },
  });

  const settings = withLocalAudioOnly(query.data ? { ...DEFAULTS, ...query.data } : DEFAULTS);

  return { query, update, settings, settingsReady };
}
