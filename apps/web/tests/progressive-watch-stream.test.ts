import { expect, test } from "bun:test";
import { selectProgressiveWatchStream } from "../src/lib/progressive-watch-stream";
import type { VideoStream } from "../src/types/stream";

const current = stream("f6f3PhauXyg");
const previous = stream("SCSafAniadQ");
const related = [stream("iLBfE_kE7JA")];

test("uses bootstrap while full metadata is still unavailable", () => {
  expect(selectProgressiveWatchStream(undefined, current, "f6f3PhauXyg", related)).toEqual({
    ...current,
    related,
  });
});

test("replaces bootstrap with full metadata without changing stream identity", () => {
  const full = { ...current, description: "Full metadata", related: [stream("udcTxiHk-2o")] };
  expect(selectProgressiveWatchStream(full, current, "f6f3PhauXyg", related)).toBe(full);
});

test("never renders stale placeholder data for another video", () => {
  expect(selectProgressiveWatchStream(previous, undefined, "f6f3PhauXyg", related)).toBeUndefined();
});

function stream(id: string): VideoStream {
  return {
    id: `https://www.youtube.com/watch?v=${id}`,
    title: id,
    thumbnail: "",
    rawThumbnail: "",
    rawChannelAvatar: "",
    channelName: "channel",
    channelAvatar: "",
    views: 0,
    duration: 60,
  };
}
