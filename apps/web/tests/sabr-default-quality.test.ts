import { expect, test } from "bun:test";
import { automaticSabrQuality, defaultSabrItag } from "../src/lib/sabr-source";
import { type SabrQualityOption, useSabrQualityStore } from "../src/stores/sabr-quality-store";

function option(itag: number, height: number): SabrQualityOption {
  return {
    itag,
    label: `${height}p`,
    height,
    codec: "H.264",
    codecValue: "avc1.64001f",
    mimeType: "video/mp4",
    width: Math.round((height * 16) / 9),
    fps: 30,
    bitrate: 1_000_000,
  };
}

const options = [option(401, 2160), option(271, 1440), option(137, 1080), option(136, 720)];

test("respects the preferred sabr resolution above 720p", () => {
  expect(defaultSabrItag(options, "1080p")).toBe(137);
  expect(defaultSabrItag(options, "2160p")).toBe(401);
});

test("chooses automatic quality from display and network constraints", () => {
  expect(automaticSabrQuality(1080, 1)).toBe("1080p");
  expect(automaticSabrQuality(1440, 2)).toBe("2160p");
  expect(automaticSabrQuality(2160, 1, true, "4g")).toBe("360p");
  expect(automaticSabrQuality(2160, 1, false, "3g")).toBe("720p");
});

test("upgrades an automatic startup selection to the preferred resolution", () => {
  useSabrQualityStore.setState({
    streamId: null,
    options: [],
    selectedItag: null,
    manuallySelected: false,
  });
  const store = useSabrQualityStore.getState();
  store.setOptions("video", [option(136, 720)], 136);
  store.setOptions("video", options, 137);
  expect(useSabrQualityStore.getState().selectedItag).toBe(137);
});

test("keeps an explicit quality selection during metadata enrichment", () => {
  const store = useSabrQualityStore.getState();
  store.setOptions("manual-video", options, 137);
  store.selectQuality("manual-video", 136);
  store.setOptions("manual-video", options, 137);
  expect(useSabrQualityStore.getState().selectedItag).toBe(136);
});

test("does not turn an automatic quality rollback into a manual preference", () => {
  const store = useSabrQualityStore.getState();
  store.restoreQuality("manual-video", 136);
  store.setOptions("manual-video", options, 137);
  expect(useSabrQualityStore.getState().selectedItag).toBe(137);
});
