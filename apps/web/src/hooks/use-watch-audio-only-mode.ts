import { type MutableRefObject, useEffect, useRef, useState } from "react";

type Args = {
  currentParam: string;
  defaultEnabled: boolean;
  settingsReady: boolean;
  positionRef: MutableRefObject<number>;
  readPositionMs: () => number | null;
};

export function useWatchAudioOnlyMode({
  currentParam,
  defaultEnabled,
  settingsReady,
  positionRef,
  readPositionMs,
}: Args) {
  const initializedParamRef = useRef<string | null>(null);
  const [active, setActive] = useState(false);
  const initialized = initializedParamRef.current === currentParam;

  useEffect(() => {
    if (!settingsReady || initializedParamRef.current === currentParam) return;
    initializedParamRef.current = currentParam;
    setActive(defaultEnabled);
  }, [currentParam, defaultEnabled, settingsReady]);

  function syncPosition() {
    const positionMs = readPositionMs();
    if (positionMs !== null && Number.isFinite(positionMs)) {
      positionRef.current = Math.max(0, positionMs);
    }
  }

  function toggle() {
    syncPosition();
    setActive((value) => !value);
  }

  function disable() {
    syncPosition();
    setActive(false);
  }

  return {
    active: settingsReady && initialized ? active : defaultEnabled,
    toggle,
    disable,
  };
}
