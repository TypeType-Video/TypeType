import { expect, test } from "bun:test";
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
