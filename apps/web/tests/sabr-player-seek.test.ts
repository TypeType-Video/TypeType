import { expect, test } from "bun:test";
import type { TypeTypeMsePlayer } from "@typetype/mse";
import { runSabrSeek, secondsFromSliderPercent } from "../src/lib/sabr-player-seek";

test("converts vidstack slider percentages to media seconds", () => {
  expect(secondsFromSliderPercent(3_554.534, 44)).toBeCloseTo(1_563.99496);
  expect(secondsFromSliderPercent(3_554.534, -1)).toBe(0);
  expect(secondsFromSliderPercent(3_554.534, 101)).toBe(3_554.534);
  expect(secondsFromSliderPercent(Number.NaN, 44)).toBeNull();
});

test("blocks concurrent sabr seeks until the active seek completes", async () => {
  let finishSeek: (() => void) | undefined;
  const positions: number[] = [];
  const states: boolean[] = [];
  const player = {
    seek: (position: number) => {
      positions.push(position);
      return new Promise<void>((resolve) => {
        finishSeek = resolve;
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

  finishSeek?.();
  await Promise.resolve();
  await Promise.resolve();

  expect(flag.current).toBe(false);
  expect(states).toEqual([true, false]);
});
