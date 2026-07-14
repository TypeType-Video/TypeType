import { expect, test } from "bun:test";
import { toPublicWatchParam, toWatchSourceUrl } from "../src/lib/watch-url";

test("shortens and expands NicoNico watch URLs", () => {
  expect(toPublicWatchParam("https://www.nicovideo.jp/watch/sm46525483")).toBe("sm46525483");
  expect(toWatchSourceUrl("sm46525483")).toBe("https://www.nicovideo.jp/watch/sm46525483");
});

test("shortens and expands BiliBili watch URLs", () => {
  expect(toPublicWatchParam("https://www.bilibili.com/video/BV1UbX3B2EZQ?p=1")).toBe(
    "BV1UbX3B2EZQ",
  );
  expect(toPublicWatchParam("https://www.bilibili.com/video/BV1UbX3B2EZQ?p=3")).toBe(
    "BV1UbX3B2EZQ?p=3",
  );
  expect(toWatchSourceUrl("BV1UbX3B2EZQ?p=3")).toBe(
    "https://www.bilibili.com/video/BV1UbX3B2EZQ?p=3",
  );
});
