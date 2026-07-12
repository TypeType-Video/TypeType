import type { TypeTypeMsePlayer } from "@typetype/mse";
import { type RefObject, useEffect, useRef } from "react";
import { isAbortError } from "../lib/sabr-playback-retry";

type ModeSwitchHandlers = {
  onError: () => void;
  onSeekStateChange: (seeking: boolean) => void;
};

export function useSabrModeSwitch(
  audioOnly: boolean,
  engineRef: RefObject<TypeTypeMsePlayer | null>,
  seekingRef: RefObject<boolean>,
  handlers: () => ModeSwitchHandlers,
): void {
  const appliedRef = useRef(audioOnly);
  const revisionRef = useRef(0);
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) {
      appliedRef.current = audioOnly;
      return;
    }
    if (appliedRef.current === audioOnly) return;
    const revision = ++revisionRef.current;
    seekingRef.current = true;
    handlers().onSeekStateChange(true);
    void engine
      .setAudioOnly(audioOnly)
      .then(() => {
        if (revision === revisionRef.current) appliedRef.current = audioOnly;
      })
      .catch((error: unknown) => {
        if (revision === revisionRef.current && !isAbortError(error)) handlers().onError();
      })
      .finally(() => {
        if (revision !== revisionRef.current) return;
        seekingRef.current = false;
        handlers().onSeekStateChange(false);
      });
  }, [audioOnly, engineRef, handlers, seekingRef]);
}
