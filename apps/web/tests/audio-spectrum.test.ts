import { expect, test } from "bun:test";
import { waveformLevel } from "../src/lib/audio-spectrum";

test("normalizes time-domain samples across the waveform", () => {
  const data = new Uint8Array([128, 160, 128, 96, 128]);

  expect(waveformLevel(data, 0, 5)).toBeCloseTo(0.6);
  expect(waveformLevel(data, 2, 5)).toBeCloseTo(0.6);
  expect(waveformLevel(data, 4, 5)).toBeCloseTo(0.6);
});

test("returns silence when waveform data is unavailable", () => {
  expect(waveformLevel(new Uint8Array(), 0, 1)).toBe(0);
});
