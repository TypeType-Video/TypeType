import { expect, test } from "bun:test";
import { crossedSponsorBlockStart } from "../src/lib/sponsorblock-skip";

test("waits for playback before skipping a segment at the beginning", () => {
  expect(crossedSponsorBlockStart(null, 0, 0)).toBeFalse();
  expect(crossedSponsorBlockStart(0, 0, 0)).toBeFalse();
  expect(crossedSponsorBlockStart(0, 0.2, 0)).toBeTrue();
});

test("skips only while crossing a later segment start", () => {
  expect(crossedSponsorBlockStart(101.9, 102.2, 102.112)).toBeTrue();
  expect(crossedSponsorBlockStart(101.9, 101.95, 102.112)).toBeFalse();
  expect(crossedSponsorBlockStart(110, 110.2, 102.112)).toBeFalse();
});
