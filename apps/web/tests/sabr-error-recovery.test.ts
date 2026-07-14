import { expect, test } from "bun:test";
import { playerErrorResumePosition } from "../src/hooks/use-player-error-resume";
import {
  claimAutomaticSabrRecovery,
  resetAutomaticSabrRecovery,
} from "../src/lib/sabr-error-recovery";

test("allows one automatic SABR recovery until reset", () => {
  const recoveryRef = { current: false };

  expect(claimAutomaticSabrRecovery(recoveryRef)).toBe(true);
  expect(claimAutomaticSabrRecovery(recoveryRef)).toBe(false);

  resetAutomaticSabrRecovery(recoveryRef);

  expect(claimAutomaticSabrRecovery(recoveryRef)).toBe(true);
});

test("prefers the captured SABR position during player recovery", () => {
  expect(playerErrorResumePosition(0, 1_795_023, 1_892_543)).toBe(1_795_023);
  expect(playerErrorResumePosition(420_000, undefined, 1_892_543)).toBe(420_000);
  expect(playerErrorResumePosition(0, 0, 1_892_543)).toBe(0);
});
