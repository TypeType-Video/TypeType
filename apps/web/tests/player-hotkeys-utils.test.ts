import { expect, test } from "bun:test";
import { keyboardSeekOffset } from "../src/components/player-hotkeys-utils";

test("maps horizontal arrow keys to ten second seeks", () => {
  expect(keyboardSeekOffset("ArrowLeft")).toBe(-10);
  expect(keyboardSeekOffset("ArrowRight")).toBe(10);
  expect(keyboardSeekOffset("ArrowUp")).toBeNull();
});
