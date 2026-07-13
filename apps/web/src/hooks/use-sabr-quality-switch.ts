import type { TypeTypeMsePlayer, TypeTypeMseQuality } from "@typetype/mse";
import { type RefObject, useEffect, useRef } from "react";
import { isAbortError } from "../lib/sabr-playback-retry";
import type { SabrPlaybackConfig } from "../lib/sabr-source";
import { useSabrQualityStore } from "../stores/sabr-quality-store";

export function useSabrQualitySwitch(
  config: SabrPlaybackConfig,
  engineReady: boolean,
  engineRef: RefObject<TypeTypeMsePlayer | null>,
  qualityRef: RefObject<TypeTypeMseQuality | null>,
  seekingRef: RefObject<boolean>,
): void {
  const revisionRef = useRef(0);
  useEffect(() => {
    const quality = {
      videoItag: config.videoItag,
      audioItag: config.audioItag,
      audioTrackId: config.audioTrackId,
    };
    const previous = qualityRef.current;
    const engine = engineRef.current;
    if (
      !engineReady ||
      !engine ||
      !previous ||
      (previous.videoItag === quality.videoItag &&
        previous.audioItag === quality.audioItag &&
        previous.audioTrackId === quality.audioTrackId)
    )
      return;
    const revision = ++revisionRef.current;
    seekingRef.current = true;
    void engine
      .setQuality(quality)
      .then(() => {
        if (revision === revisionRef.current) qualityRef.current = quality;
      })
      .catch((error: unknown) => {
        if (revision !== revisionRef.current || isAbortError(error)) return;
        const store = useSabrQualityStore.getState();
        if (store.streamId) store.restoreQuality(store.streamId, previous.videoItag);
      })
      .finally(() => {
        if (revision === revisionRef.current) seekingRef.current = false;
      });
  }, [config, engineReady, engineRef, qualityRef, seekingRef]);
}
