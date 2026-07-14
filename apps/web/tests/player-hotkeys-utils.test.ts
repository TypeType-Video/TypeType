import { expect, test } from "bun:test";
import { keyboardSeekOffset, nextKeyboardSeekTarget } from "../src/components/player-hotkeys-utils";

test("maps horizontal arrow keys to ten second seeks", () => {
  expect(keyboardSeekOffset("ArrowLeft")).toBe(-10);
  expect(keyboardSeekOffset("ArrowRight")).toBe(10);
  expect(keyboardSeekOffset("ArrowUp")).toBeNull();
});

test("accumulates rapid arrow seeks from the last requested target", () => {
  const first = nextKeyboardSeekTarget(10, 120, 10, { position: 0, updatedAt: 0 }, 2_000);
  const second = nextKeyboardSeekTarget(10, 120, 10, first, 2_100);
  const third = nextKeyboardSeekTarget(20, 120, 10, second, 2_200);

  expect([first.position, second.position, third.position]).toEqual([20, 30, 40]);
  expect(nextKeyboardSeekTarget(25, 120, 10, third, 4_000).position).toBe(35);
});
