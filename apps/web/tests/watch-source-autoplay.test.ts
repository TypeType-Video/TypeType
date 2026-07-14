import { expect, test } from "bun:test";
import { decideWatchSourceAutoplay } from "../src/hooks/use-watch-player-source-state";

const previous = {
  playerKey: "video",
  streamId: "video-id",
  settingsReady: true,
  autoplay: true,
};

test("uses autoplay setting only for the initial source", () => {
  expect(
    decideWatchSourceAutoplay({
      previous: null,
      streamId: "video-id",
      retryKey: 0,
      settingsReady: true,
      autoplayEnabled: true,
      playbackIntent: null,
      autoplayIntent: false,
    }),
  ).toBe(true);
});

test("carries initial autoplay through source bootstrap", () => {
  expect(
    decideWatchSourceAutoplay({
      previous,
      streamId: "video-id",
      retryKey: 0,
      settingsReady: true,
      autoplayEnabled: true,
      playbackIntent: null,
      autoplayIntent: false,
    }),
  ).toBe(true);
});

test("preserves pause across a source switch", () => {
  expect(
    decideWatchSourceAutoplay({
      previous,
      streamId: "video-id",
      retryKey: 0,
      settingsReady: true,
      autoplayEnabled: true,
      playbackIntent: false,
      autoplayIntent: false,
    }),
  ).toBe(false);
});

test("preserves playback across a source switch", () => {
  expect(
    decideWatchSourceAutoplay({
      previous,
      streamId: "video-id",
      retryKey: 0,
      settingsReady: true,
      autoplayEnabled: false,
      playbackIntent: true,
      autoplayIntent: false,
    }),
  ).toBe(true);
});
