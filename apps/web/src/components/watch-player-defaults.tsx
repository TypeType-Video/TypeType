import type { SettingsItem } from "../types/user";
import { PlayerDefaults } from "./player-defaults";
import { PlayerFocuser } from "./player-internals";

type Props = {
  settings: SettingsItem;
  qualityFailed: boolean;
  originalAudioTrackId?: string | null;
  preferredDefaultAudioTrackId?: string | null;
  originalAudioLocale?: string | null;
  onOriginalLanguageUnavailable: () => void;
};

export function WatchPlayerDefaults({
  settings,
  qualityFailed,
  originalAudioTrackId,
  preferredDefaultAudioTrackId,
  originalAudioLocale,
  onOriginalLanguageUnavailable,
}: Props) {
  return (
    <>
      <PlayerFocuser />
      <PlayerDefaults
        defaultQuality={qualityFailed ? undefined : settings.defaultQuality}
        defaultAudioLanguage={settings.defaultAudioLanguage || undefined}
        preferOriginalLanguage={settings.preferOriginalLanguage}
        requireOriginalLanguage
        onOriginalLanguageUnavailable={onOriginalLanguageUnavailable}
        originalAudioTrackId={originalAudioTrackId}
        preferredDefaultAudioTrackId={preferredDefaultAudioTrackId}
        originalAudioLocale={originalAudioLocale}
        subtitlesEnabled={settings.subtitlesEnabled}
        defaultSubtitleLanguage={settings.defaultSubtitleLanguage || undefined}
      />
    </>
  );
}
