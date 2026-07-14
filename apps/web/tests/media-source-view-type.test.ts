import { expect, test } from "bun:test";
import {
  adaptiveSourceNeedsVideoProvider,
  mediaSourceViewType,
} from "../src/lib/media-source-view-type";

test("uses a video provider for adaptive audio manifests", () => {
  expect(
    adaptiveSourceNeedsVideoProvider({ src: "/audio.m3u8", type: "application/x-mpegurl" }),
  ).toBe(true);
  expect(adaptiveSourceNeedsVideoProvider({ src: "/audio.m4a", type: "audio/mp4" })).toBe(false);
});

test("keeps the video provider while SABR switches to audio only", () => {
  const audio = { src: "/audio.m4a", type: "audio/mp4" } as const;
  expect(mediaSourceViewType(true, true, audio)).toBe("video");
  expect(mediaSourceViewType(true, false, audio)).toBe("audio");
  expect(mediaSourceViewType(false, true, audio)).toBe("video");
});
