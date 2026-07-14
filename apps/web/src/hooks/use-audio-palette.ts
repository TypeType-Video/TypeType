import { useEffect, useState } from "react";

type Rgb = {
  r: number;
  g: number;
  b: number;
};

type Swatch = Rgb & {
  weight: number;
};

export type AudioPalette = {
  primary: string;
  secondary: string;
  ambient: string;
  waveTop: string;
  waveMid: string;
  waveBottom: string;
};

const RED = { r: 239, g: 68, b: 68 };
const DARK = { r: 9, g: 9, b: 11 };
const WHITE = { r: 255, g: 255, b: 255 };
const DEFAULT_PALETTE = toPalette(RED, { r: 127, g: 29, b: 29 });

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mix(color: Rgb, target: Rgb, amount: number): Rgb {
  return {
    r: clamp(color.r + (target.r - color.r) * amount),
    g: clamp(color.g + (target.g - color.g) * amount),
    b: clamp(color.b + (target.b - color.b) * amount),
  };
}

function channels(color: Rgb): string {
  return `${clamp(color.r)} ${clamp(color.g)} ${clamp(color.b)}`;
}

function distance(a: Rgb, b: Rgb): number {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function saturation(color: Rgb): number {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  if (max === min) return 0;
  const delta = max - min;
  return delta / (1 - Math.abs(2 * lightness - 1));
}

function hue(color: Rgb): number {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;
  const value =
    max === r
      ? (g - b) / delta + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / delta + 2
        : (r - g) / delta + 4;
  return value * 60;
}

function lightness(color: Rgb): number {
  const max = Math.max(color.r, color.g, color.b) / 255;
  const min = Math.min(color.r, color.g, color.b) / 255;
  return (max + min) / 2;
}

function toPalette(primary: Rgb, secondary: Rgb): AudioPalette {
  const warmPrimary = mix(primary, WHITE, 0.18);
  const warmSecondary = mix(secondary, WHITE, 0.12);
  return {
    primary: channels(warmPrimary),
    secondary: channels(warmSecondary),
    ambient: channels(mix(primary, DARK, 0.58)),
    waveTop: channels(mix(warmPrimary, WHITE, 0.48)),
    waveMid: channels(mix(warmPrimary, warmSecondary, 0.38)),
    waveBottom: channels(mix(warmSecondary, DARK, 0.54)),
  };
}

function readPalette(image: HTMLImageElement): AudioPalette {
  const canvas = document.createElement("canvas");
  canvas.width = 48;
  canvas.height = 32;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return DEFAULT_PALETTE;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const swatches = new Map<number, Swatch>();
  for (let index = 0; index < pixels.length; index += 16) {
    const color = { r: pixels[index] ?? 0, g: pixels[index + 1] ?? 0, b: pixels[index + 2] ?? 0 };
    const alpha = pixels[index + 3] ?? 0;
    const colorSaturation = saturation(color);
    const colorLightness = lightness(color);
    if (alpha < 160 || colorSaturation < 0.18 || colorLightness < 0.08 || colorLightness > 0.9)
      continue;
    const bucket = Math.round(hue(color) / 18);
    const weight = (0.35 + colorSaturation) * (1 - Math.abs(colorLightness - 0.52));
    const current = swatches.get(bucket);
    if (current) {
      const total = current.weight + weight;
      swatches.set(bucket, {
        r: (current.r * current.weight + color.r * weight) / total,
        g: (current.g * current.weight + color.g * weight) / total,
        b: (current.b * current.weight + color.b * weight) / total,
        weight: total,
      });
    } else {
      swatches.set(bucket, { ...color, weight });
    }
  }
  const ranked = [...swatches.values()].sort((a, b) => b.weight - a.weight);
  const primary = ranked[0] ?? RED;
  const secondary =
    ranked.find((color) => distance(color, primary) > 72) ?? mix(primary, WHITE, 0.28);
  return toPalette(primary, secondary);
}

export function useAudioPalette(image: string): AudioPalette {
  const [palette, setPalette] = useState(DEFAULT_PALETTE);

  useEffect(() => {
    if (!image) {
      setPalette(DEFAULT_PALETTE);
      return;
    }
    let cancelled = false;
    const element = new Image();
    element.crossOrigin = "anonymous";
    element.decoding = "async";
    element.onload = () => {
      if (cancelled) return;
      try {
        setPalette(readPalette(element));
      } catch {
        setPalette(DEFAULT_PALETTE);
      }
    };
    element.onerror = () => {
      if (!cancelled) setPalette(DEFAULT_PALETTE);
    };
    element.src = image;
    return () => {
      cancelled = true;
    };
  }, [image]);

  return palette;
}
