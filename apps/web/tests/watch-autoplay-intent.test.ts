import { expect, test } from "bun:test";
import {
  consumeWatchAutoplayIntent,
  markWatchAutoplayIntent,
} from "../src/lib/watch-autoplay-intent";

test("consumes a watch autoplay intent once", () => {
  markWatchAutoplayIntent();
  expect(consumeWatchAutoplayIntent()).toBe(true);
  expect(consumeWatchAutoplayIntent()).toBe(false);
});
