import { expect, test } from "bun:test";
import { buildNicoHlsManifest } from "../src/lib/nico-hls-manifest";
import type { AudioStreamItem, VideoStreamItem } from "../src/types/api";

const video = {
  url: "https://delivery.example/video.m3u8",
  resolution: "720p",
  bitrate: 2500,
  height: 720,
  width: 1280,
} as VideoStreamItem;

const audio = {
  url: "https://delivery.example/audio.m3u8",
  quality: "192",
  bitrate: 192,
} as AudioStreamItem;

test("describes Nico codecs and independent segments", () => {
  const source = buildNicoHlsManifest([video], [audio]);
  expect(source).not.toBeNull();

  const manifest = atob(source?.split(",", 2)[1] ?? "");
  expect(manifest).toContain("#EXT-X-INDEPENDENT-SEGMENTS");
  expect(manifest).toContain('CODECS="avc1.4d4020,mp4a.40.2"');
});
