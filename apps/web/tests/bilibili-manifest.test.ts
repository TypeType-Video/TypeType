import { expect, test } from "bun:test";
import { buildBilibiliDashManifest } from "../src/lib/bilibili-manifest";
import type { AudioStreamItem, VideoStreamItem } from "../src/types/api";

const video = {
  url: "https://example.com/video.m4s",
  format: "MPEG-4",
  resolution: "480P",
  bitrate: 790090,
  codec: "avc1.64001F",
  mimeType: "video/mp4",
  isVideoOnly: true,
  itag: -1,
  width: 852,
  height: 480,
  fps: 29,
  contentLength: 0,
  initStart: 0,
  initEnd: 1011,
  indexStart: 1012,
  indexEnd: 1475,
} satisfies VideoStreamItem;

const audio = {
  url: "https://example.com/audio.m4s",
  format: "m4a",
  bitrate: 129717,
  codec: "mp4a",
  mimeType: "audio/mp4",
  quality: "132K",
  audioTrackId: null,
  audioTrackName: null,
  audioLocale: null,
  isOriginal: false,
  itag: -1,
  contentLength: 0,
  initStart: 0,
  initEnd: 907,
  indexStart: 908,
  indexEnd: 1371,
} satisfies AudioStreamItem;

test("describes BiliBili initialization and index byte ranges", () => {
  Object.assign(globalThis, { window: { location: { origin: "https://typetype.test" } } });
  const source = buildBilibiliDashManifest([video], [audio], 179);
  expect(source).not.toBeNull();
  const xml = atob(source?.split(",")[1] ?? "");
  expect(xml).toContain('<SegmentBase indexRange="1012-1475">');
  expect(xml).toContain('<Initialization range="0-1011"/>');
  expect(xml).toContain('<SegmentBase indexRange="908-1371">');
  expect(xml).toContain('<Initialization range="0-907"/>');
});
