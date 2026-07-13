import { expect, test } from "bun:test";
import type { TypeTypeMsePlayer } from "@typetype/mse";
import { runSabrSeek, secondsFromSliderPercent } from "../src/lib/sabr-player-seek";

test("converts vidstack slider percentages to media seconds", () => {
  expect(secondsFromSliderPercent(3_554.534, 44)).toBeCloseTo(1_563.99496);
  expect(secondsFromSliderPercent(3_554.534, -1)).toBe(0);
  expect(secondsFromSliderPercent(3_554.534, 101)).toBe(3_554.534);
  expect(secondsFromSliderPercent(Number.NaN, 44)).toBeNull();
});

test("queues the latest sabr seek until the active seek completes", async () => {
  const finishSeeks: Array<() => void> = [];
  const positions: number[] = [];
  const states: boolean[] = [];
  const player = {
    seek: (position: number) => {
      positions.push(position);
      return new Promise<void>((resolve) => {
        finishSeeks.push(resolve);
      });
    },
  } as TypeTypeMsePlayer;
  const flag = { current: false };

  runSabrSeek(
    player,
    60_000,
    flag,
    () => undefined,
    (state) => states.push(state),
  );
  runSabrSeek(
    player,
    120_000,
    flag,
    () => undefined,
    (state) => states.push(state),
  );

  expect(positions).toEqual([60_000]);
  expect(flag.current).toBe(true);
  expect(states).toEqual([true]);

  finishSeeks.shift()?.();
  await Bun.sleep(110);
  await Promise.resolve();
  await Promise.resolve();

  expect(positions).toEqual([60_000, 120_000]);
  expect(flag.current).toBe(true);
  expect(states).toEqual([true, false, true]);

  finishSeeks.shift()?.();
  await Promise.resolve();
  await Promise.resolve();

  expect(flag.current).toBe(false);
  expect(states).toEqual([true, false, true, false]);
});
