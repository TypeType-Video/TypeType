import { useEffect, useRef } from "react";

type Args = {
  streamId: string;
  settingsReady: boolean;
  navigating: boolean;
  audioOnlyEnabled: boolean;
  audioOnlyLoading: boolean;
  hasAudioOnlySource: boolean;
};

export function useWatchInitialAudioSource({
  streamId,
  settingsReady,
  navigating,
  audioOnlyEnabled,
  audioOnlyLoading,
  hasAudioOnlySource,
}: Args) {
  const renderedPlayerRef = useRef(false);
  const renderedStreamRef = useRef(streamId);

  if (renderedStreamRef.current !== streamId) {
    renderedStreamRef.current = streamId;
    renderedPlayerRef.current = false;
  }

  useEffect(() => {
    if (!settingsReady || navigating) return;
    if (audioOnlyEnabled && !hasAudioOnlySource) return;
    renderedPlayerRef.current = true;
  }, [audioOnlyEnabled, hasAudioOnlySource, navigating, settingsReady]);

  return audioOnlyLoading && !renderedPlayerRef.current;
}
