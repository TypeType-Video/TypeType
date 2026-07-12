import { expect, test } from "bun:test";
import {
  registerSabrVidstackControls,
  requestSabrSeek,
  requestSabrVidstackPlayback,
} from "../src/lib/sabr-vidstack-bridge";

test("replays a pending SABR play request when MSE controls register", async () => {
  let plays = 0;
  const video = { autoplay: false, pause: () => {} } as HTMLVideoElement;

  await requestSabrVidstackPlayback(video, true);
  registerSabrVidstackControls(video, {
    play: async () => {
      plays += 1;
    },
    pause: () => {},
    seek: () => {},
  });
  await Promise.resolve();

  expect(video.autoplay).toBe(true);
  expect(plays).toBe(1);
});

test("keeps only the latest pending SABR playback intent", async () => {
  let pauses = 0;
  const video = { autoplay: false, pause: () => {} } as HTMLVideoElement;

  await requestSabrVidstackPlayback(video, true);
  await requestSabrVidstackPlayback(video, false);
  registerSabrVidstackControls(video, {
    play: async () => {},
    pause: () => {
      pauses += 1;
    },
    seek: () => {},
  });

  expect(video.autoplay).toBe(false);
  expect(pauses).toBe(1);
});

test("sends only explicit SABR seek requests to registered MSE controls", () => {
  const positions: number[] = [];
  const video = { autoplay: false, pause: () => {} } as HTMLVideoElement;

  expect(requestSabrSeek(video, 12)).toBe(false);
  registerSabrVidstackControls(video, {
    play: async () => {},
    pause: () => {},
    seek: (seconds) => positions.push(seconds),
  });

  expect(requestSabrSeek(video, 95)).toBe(true);
  expect(positions).toEqual([95]);
});
