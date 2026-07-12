import { type MutableRefObject, useEffect, useState } from "react";
import type { MediaSrc } from "../lib/vidstack";
import { toWatchSourceUrl } from "../lib/watch-url";
import type { SettingsItem } from "../types/user";
import { useWatchAudioOnlyMode } from "./use-watch-audio-only-mode";
import { useWatchAudioOnlySource } from "./use-watch-audio-only-source";

type Args = {
  currentParam: string;
  settings: SettingsItem;
  settingsReady: boolean;
  isLive: boolean;
  positionRef: MutableRefObject<number>;
  readPositionMs: () => number | null;
  clearFailed: () => void;
  sabrEnabled: boolean;
};

type WatchAudioOnlyPlayback = {
  src: MediaSrc | null;
  controls: WatchAudioOnlyControls;
  switchPositionMs: number | null;
  active: boolean;
  loading: boolean;
  enabled: boolean;
  unavailable: boolean;
  toggle: () => void;
  fail: () => boolean;
};

export type WatchAudioOnlyControls = {
  active: boolean;
  loading: boolean;
  onToggle: () => void;
};

export function useWatchAudioOnlyPlayback({
  currentParam,
  settings,
  settingsReady,
  isLive,
  positionRef,
  readPositionMs,
  clearFailed,
  sabrEnabled,
}: Args): WatchAudioOnlyPlayback {
  const mode = useWatchAudioOnlyMode({
    currentParam,
    defaultEnabled: settings.audioOnlyPlayback,
    settingsReady,
    positionRef,
    readPositionMs,
  });
  const failureKey = `${currentParam}:${mode.active}`;
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const source = useWatchAudioOnlySource(
    toWatchSourceUrl(currentParam),
    settings,
    isLive,
    mode.active && !sabrEnabled,
  );
  const runtimeFailed = failedKey === failureKey;
  const src = runtimeFailed || sabrEnabled ? null : source.src;

  useEffect(() => {
    if (!source.unavailable || !mode.active) return;
    mode.disable();
  }, [mode, source.unavailable]);

  function fail() {
    if (!src) return false;
    clearFailed();
    setFailedKey(failureKey);
    mode.disable();
    return true;
  }

  return {
    src,
    controls: {
      active: mode.active,
      loading: !sabrEnabled && source.loading,
      onToggle: mode.toggle,
    },
    switchPositionMs: mode.switchPositionMs,
    active: mode.active,
    loading: !sabrEnabled && source.loading,
    enabled: sabrEnabled ? mode.active : source.enabled,
    unavailable: source.unavailable,
    toggle: mode.toggle,
    fail,
  };
}
