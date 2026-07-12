import { expect, test } from "bun:test";
import type { TypeTypeMsePlayer } from "@typetype/mse";
import { runSabrSeek } from "../src/lib/sabr-player-seek";

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
