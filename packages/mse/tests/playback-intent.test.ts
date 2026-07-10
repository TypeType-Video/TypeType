import { expect, test } from "bun:test";
import { PlaybackIntent } from "../src/playback-intent";

test("preserves playback intent while a seek replaces the media source", () => {
  const intent = new PlaybackIntent();
  intent.capture(false, false);
  intent.capture(true, true);
  expect(intent.shouldResume).toBe(true);
});

test("honors explicit pause and play during a seek", () => {
  const intent = new PlaybackIntent();
  intent.capture(false, false);
  intent.pause();
  expect(intent.shouldResume).toBe(false);
  intent.play();
  expect(intent.shouldResume).toBe(true);
});
