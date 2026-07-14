import { expect, test } from "bun:test";
import type { CodecFamily } from "../src/lib/quality-utils";
import {
  maxSabrCodecHeight,
  sabrCodecOptions,
  sabrResolutionOptions,
  selectSabrCodec,
} from "../src/lib/sabr-quality-selection";
import type { SabrQualityOption } from "../src/stores/sabr-quality-store";

function option(itag: number, height: number, codec: CodecFamily): SabrQualityOption {
  return {
    itag,
    label: `${height}p`,
    height,
    codec,
    codecValue: codec === "H.264" ? "avc1.64001f" : codec.toLowerCase(),
    mimeType: codec === "VP9" ? "video/webm" : "video/mp4",
    width: Math.round((height * 16) / 9),
    fps: 30,
    bitrate: 1_000_000,
  };
}

const options = [
  option(137, 1080, "H.264"),
  option(136, 720, "H.264"),
  option(248, 1080, "VP9"),
  option(247, 720, "VP9"),
  option(243, 360, "VP9"),
  option(399, 1080, "AV1"),
  option(398, 720, "AV1"),
];

test("keeps selected codec while listing sabr resolutions", () => {
  const selected = options.find((item) => item.itag === 247);
  if (!selected) throw new Error("Missing selected option");

  expect(sabrResolutionOptions(options, selected).map((item) => item.itag)).toEqual([
    248, 247, 243,
  ]);
});

test("switches sabr codec at the current resolution", () => {
  const selected = options.find((item) => item.itag === 247);
  if (!selected) throw new Error("Missing selected option");

  expect(selectSabrCodec(options, selected, "AV1")?.itag).toBe(398);
  expect(sabrCodecOptions(options)).toEqual(["H.264", "VP9", "AV1"]);
  expect(maxSabrCodecHeight(options, "H.264")).toBe(1080);
});

test("falls back to the nearest lower resolution for a codec", () => {
  const selected = option(401, 2160, "AV1");

  expect(selectSabrCodec(options, selected, "H.264")?.itag).toBe(137);
});
