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
  const [switchPositionMs, setSwitchPositionMs] = useState<number | null>(null);
  const initialized = initializedParamRef.current === currentParam;

  useEffect(() => {
    if (!settingsReady || initializedParamRef.current === currentParam) return;
    initializedParamRef.current = currentParam;
    setActive(defaultEnabled);
    setSwitchPositionMs(null);
  }, [currentParam, defaultEnabled, settingsReady]);

  function syncPosition() {
    const positionMs = readPositionMs();
    if (positionMs !== null && Number.isFinite(positionMs)) {
      const nextPosition = Math.max(0, positionMs);
      positionRef.current = nextPosition;
      setSwitchPositionMs(nextPosition);
      return nextPosition;
    }
    setSwitchPositionMs(positionRef.current);
    return positionRef.current;
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
    switchPositionMs,
    toggle,
    disable,
  };
}
