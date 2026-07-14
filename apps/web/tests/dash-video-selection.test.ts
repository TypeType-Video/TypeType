import { expect, mock, test } from "bun:test";
import type * as dashjs from "dashjs";
import { selectDashTrack } from "../src/lib/dash-video";

test("selects DASH quality by relative representation index", () => {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const updateSettings = mock(() => undefined);
  const setRepresentation = mock(() => undefined);
  const setCurrentTrack = mock(() => undefined);
  const representations = [
    { height: 144, index: 11 },
    { height: 240, index: 27 },
    { height: 360, index: 42 },
    { height: 720, index: 88 },
  ] as dashjs.Representation[];
  const player = {
    getRepresentationsByType: () => representations,
    setCurrentTrack,
    setRepresentationForTypeByIndex: setRepresentation,
    updateSettings,
  } as unknown as dashjs.MediaPlayerClass;
  const track = { bitrateList: [] } as unknown as dashjs.MediaInfo;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      setTimeout: (callback: () => void) => {
        callback();
        return 0;
      },
    },
  });

  try {
    selectDashTrack(player, track, 360);
  } finally {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }

  expect(updateSettings).toHaveBeenCalledWith({
    streaming: { abr: { autoSwitchBitrate: { video: false } } },
  });
  expect(setRepresentation).toHaveBeenCalledTimes(2);
  expect(setRepresentation).toHaveBeenNthCalledWith(1, "video", 2, true);
  expect(setRepresentation).toHaveBeenNthCalledWith(2, "video", 2, true);
});
