import { expect, test } from "bun:test";
import { waveformLevel } from "../src/lib/audio-spectrum";

test("normalizes frequency samples across the waveform", () => {
  const data = new Uint8Array([0, 64, 128, 64, 0]);

  expect(waveformLevel(data, 0, 5)).toBeCloseTo(0.45);
  expect(waveformLevel(data, 2, 5)).toBeCloseTo(0.9);
  expect(waveformLevel(data, 4, 5)).toBeCloseTo(0.45);
});

test("returns silence when waveform data is unavailable", () => {
  expect(waveformLevel(new Uint8Array(), 0, 1)).toBe(0);
});
