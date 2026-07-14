import { expect, test } from "bun:test";
import { bestSabrItag, type SabrCodecProbe } from "../src/lib/sabr-codec-capabilities";
import type { SabrQualityOption } from "../src/stores/sabr-quality-store";

function option(itag: number, codec: SabrQualityOption["codec"]): SabrQualityOption {
  return {
    itag,
    label: "720p",
    height: 720,
    codec,
    codecValue: codec === "H.264" ? "avc1.64001f" : codec.toLowerCase(),
    mimeType: codec === "VP9" ? "video/webm" : "video/mp4",
    width: 1280,
    fps: 30,
    bitrate: 2_000_000,
  };
}

const options = [option(136, "H.264"), option(247, "VP9"), option(398, "AV1")];

test("prefers power efficient av1 for automatic sabr playback", async () => {
  const probe: SabrCodecProbe = async (configuration) => ({
    supported: true,
    smooth: true,
    powerEfficient: configuration.video?.contentType.includes("av1") ?? false,
    keySystemAccess: null,
  });

  expect(await bestSabrItag(options, "720p", probe)).toBe(398);
});

test("falls back to smooth h264 when advanced codecs are inefficient", async () => {
  const probe: SabrCodecProbe = async (configuration) => ({
    supported: true,
    smooth: true,
    powerEfficient: configuration.video?.contentType.includes("avc1") ?? false,
    keySystemAccess: null,
  });

  expect(await bestSabrItag(options, "720p", probe)).toBe(136);
});

test("uses h264 fallback when capability probing is unavailable", async () => {
  expect(await bestSabrItag(options, "720p")).toBe(136);
});
