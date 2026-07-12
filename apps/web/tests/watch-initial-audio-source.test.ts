import { expect, test } from "bun:test";
import { useWatchInitialAudioSource } from "../src/hooks/use-watch-initial-audio-source";

const base = {
  streamId: "video",
  settingsReady: true,
  navigating: false,
};

test("waits while an enabled audio source is loading", () => {
  expect(
    useWatchInitialAudioSource({
      ...base,
      audioOnlyEnabled: true,
      audioOnlyLoading: true,
      hasAudioOnlySource: false,
    }),
  ).toBe(true);
});

test("releases the player as soon as the audio source exists", () => {
  expect(
    useWatchInitialAudioSource({
      ...base,
      audioOnlyEnabled: true,
      audioOnlyLoading: true,
      hasAudioOnlySource: true,
    }),
  ).toBe(false);
});
