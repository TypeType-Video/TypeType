import { expect, test } from "bun:test";
import { resolveStoredPlaybackMode } from "../src/lib/playback-mode";
import {
  sabrBootstrapEndpoint,
  sabrBootstrapQueryKey,
  streamEndpoint,
  streamQueryKey,
} from "../src/lib/stream-request";

const VIDEO_URL = "https://www.youtube.com/watch?v=test";

test("uses isolated stream endpoints and query keys for each playback mode", () => {
  expect(streamEndpoint(VIDEO_URL, "legacy")).toContain("/streams/youtube/legacy?url=");
  expect(streamEndpoint(VIDEO_URL, "sabr")).toContain("/streams/youtube/sabr?url=");
  expect(streamQueryKey(VIDEO_URL, false, "legacy")).toEqual([
    "stream",
    VIDEO_URL,
    "anon",
    "legacy",
  ]);
  expect(streamQueryKey(VIDEO_URL, false, "sabr")).toEqual(["stream", VIDEO_URL, "anon", "sabr"]);
  expect(streamEndpoint("https://www.nicovideo.jp/watch/test", "sabr")).toContain(
    "/streams/niconico?url=",
  );
  expect(streamEndpoint("https://www.bilibili.com/video/test", "sabr")).toContain(
    "/streams/bilibili?url=",
  );
});

test("uses an isolated YouTube SABR bootstrap request", () => {
  expect(sabrBootstrapEndpoint(VIDEO_URL)).toContain("/streams/youtube/sabr/bootstrap?url=");
  expect(sabrBootstrapQueryKey(VIDEO_URL, true)).toEqual(["stream-bootstrap", VIDEO_URL, "auth"]);
  expect(sabrBootstrapEndpoint("https://www.nicovideo.jp/watch/test")).toBeNull();
});

test("defaults new users to classic and migrates old playback values", () => {
  expect(resolveStoredPlaybackMode(null)).toBe("legacy");
  expect(resolveStoredPlaybackMode("adaptive")).toBe("sabr");
  expect(resolveStoredPlaybackMode("ios-legacy-compat")).toBe("legacy");
});
