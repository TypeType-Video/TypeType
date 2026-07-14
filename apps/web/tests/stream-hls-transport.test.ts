import { expect, test } from "bun:test";
import { shouldUseClassicHls } from "../src/lib/stream-src";

test("uses classic HLS when DASH is unavailable", () => {
  expect(shouldUseClassicHls("https://example.com/master.m3u8", false, false, false)).toBe(true);
});

test("keeps DASH ahead of unsigned classic HLS", () => {
  expect(shouldUseClassicHls("https://example.com/master.m3u8", false, false, true)).toBe(false);
});

test("does not retry failed classic HLS", () => {
  expect(shouldUseClassicHls("https://example.com/master.m3u8", false, true, false)).toBe(false);
});
