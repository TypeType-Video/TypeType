import { expect, test } from "bun:test";
import { shouldPreloadAutoplayTarget } from "../src/lib/autoplay-preload";

test("preloads the autoplay target during the final playback window", () => {
  expect(shouldPreloadAutoplayTarget(54_999, 100_000, true, true)).toBe(false);
  expect(shouldPreloadAutoplayTarget(55_000, 100_000, true, true)).toBe(true);
  expect(shouldPreloadAutoplayTarget(99_000, 100_000, false, true)).toBe(false);
  expect(shouldPreloadAutoplayTarget(99_000, 100_000, true, false)).toBe(false);
});
