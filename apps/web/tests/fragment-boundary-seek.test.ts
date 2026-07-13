import { expect, test } from "bun:test";
import { snapToFragmentBoundary } from "../src/lib/fragment-boundary-seek";

test("snaps WebKit CMAF seeks to the nearest fragment boundary", () => {
  expect(snapToFragmentBoundary(9.9, 6)).toBe(12.05);
  expect(snapToFragmentBoundary(7.2, 6)).toBe(6.05);
  expect(snapToFragmentBoundary(12, 6)).toBe(12.05);
  expect(snapToFragmentBoundary(0, 6)).toBe(0);
  expect(snapToFragmentBoundary(9.9, 0)).toBe(9.9);
});
