type Args = {
  streamId: string;
  settingsReady: boolean;
  navigating: boolean;
  audioOnlyEnabled: boolean;
  audioOnlyLoading: boolean;
  hasAudioOnlySource: boolean;
};

export function useWatchInitialAudioSource({
  audioOnlyEnabled,
  audioOnlyLoading,
  hasAudioOnlySource,
}: Args): boolean {
  return audioOnlyEnabled && audioOnlyLoading && !hasAudioOnlySource;
}
