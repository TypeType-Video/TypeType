import { useEffect, useRef } from "react";
import { audioSpectrum, waveformEnergy, waveformLevel } from "../lib/audio-spectrum";

type VisualizerColors = {
  top: string;
  mid: string;
  bottom: string;
};

type VisualizerMotion = {
  values: Float32Array;
  targets: Float32Array;
  phases: Float32Array;
  speeds: Float32Array;
  intervals: Uint8Array;
  offsets: Uint8Array;
};

function createMotion(bars: number): VisualizerMotion {
  const motion: VisualizerMotion = {
    values: new Float32Array(bars),
    targets: new Float32Array(bars),
    phases: new Float32Array(bars),
    speeds: new Float32Array(bars),
    intervals: new Uint8Array(bars),
    offsets: new Uint8Array(bars),
  };
  for (let index = 0; index < bars; index += 1) {
    motion.values[index] = Math.random();
    motion.targets[index] = Math.random();
    motion.phases[index] = Math.random() * Math.PI * 2;
    motion.speeds[index] = 0.018 + Math.random() * 0.055;
    motion.intervals[index] = 4 + Math.floor(Math.random() * 10);
    motion.offsets[index] = Math.floor(Math.random() * motion.intervals[index]);
  }
  return motion;
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * scale));
  canvas.height = Math.max(1, Math.floor(rect.height * scale));
}

function drawBars(
  context: CanvasRenderingContext2D,
  levels: Float32Array,
  motion: VisualizerMotion,
  spectrum: Uint8Array | null,
  active: boolean,
  colors: VisualizerColors,
  frame: number,
) {
  const width = context.canvas.width;
  const height = context.canvas.height;
  const bars = levels.length;
  const gap = width / bars / 3.4;
  const barWidth = width / bars - gap;
  context.clearRect(0, 0, width, height);
  const gradient = context.createLinearGradient(0, height * 0.15, 0, height * 0.85);
  gradient.addColorStop(0, colors.top);
  gradient.addColorStop(0.48, colors.mid);
  gradient.addColorStop(1, colors.bottom);
  context.fillStyle = gradient;
  const energy = spectrum ? waveformEnergy(spectrum) : 0;

  for (let index = 0; index < bars; index += 1) {
    const measured = spectrum ? waveformLevel(spectrum, index, bars, energy) : 0;
    const interval = motion.intervals[index] ?? 10;
    if ((frame + (motion.offsets[index] ?? 0)) % interval === 0) {
      motion.targets[index] = Math.random();
    }
    motion.values[index] += ((motion.targets[index] ?? 0) - (motion.values[index] ?? 0)) * 0.11;
    const pulse =
      0.5 + Math.sin(frame * (motion.speeds[index] ?? 0.03) + (motion.phases[index] ?? 0)) * 0.5;
    const signal = active ? Math.max(energy, 0.18) : 0;
    const movement = signal * (0.08 + (motion.values[index] ?? 0) * 0.52 + pulse * 0.26);
    const target = active ? Math.min(1, 0.035 + measured * 0.44 + movement) : 0.025;
    levels[index] += (target - levels[index]) * (active ? 0.22 : 0.08);
    const edgeFade = 0.65 + Math.sin((index / bars) * Math.PI) * 0.35;
    const barHeight = Math.max(height * 0.025, levels[index] * edgeFade * height * 0.58);
    const x = index * (barWidth + gap);
    const y = height / 2 - barHeight / 2;
    context.fillRect(x, y, barWidth, barHeight);
  }
}

function colorVar(element: Element, name: string, fallback: string, alpha: number) {
  const channels = getComputedStyle(element).getPropertyValue(name).trim() || fallback;
  const values = channels
    .split(/\s+/)
    .map((value) => Number(value))
    .filter(Number.isFinite);
  if (values.length !== 3) return `rgba(${fallback.replaceAll(" ", ", ")}, ${alpha})`;
  return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`;
}

function visualizerColors(element: Element): VisualizerColors {
  return {
    top: colorVar(element, "--typetype-audio-wave-top", "255 255 255", 0.25),
    mid: colorVar(element, "--typetype-audio-wave-mid", "248 113 113", 0.66),
    bottom: colorVar(element, "--typetype-audio-wave-bottom", "127 29 29", 0.16),
  };
}

export function AudioOnlyVisualizer({ media }: { media: HTMLMediaElement | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    let activeMedia = media;

    resizeCanvas(canvas);
    const observer = new ResizeObserver(() => resizeCanvas(canvas));
    observer.observe(canvas);
    const levels = new Float32Array(112);
    const motion = createMotion(levels.length);
    let spectrum = activeMedia && !activeMedia.paused ? audioSpectrum(activeMedia) : null;
    let colors = visualizerColors(canvas);
    let animation = 0;
    let frame = 0;
    const activate = (event?: Event) => {
      if (event?.target instanceof HTMLMediaElement) activeMedia = event.target;
      activeMedia ??=
        [...document.querySelectorAll<HTMLMediaElement>("video,audio")].find(
          (element) => element.currentSrc && !element.paused,
        ) ?? null;
      if (!activeMedia) return;
      spectrum ??= audioSpectrum(activeMedia);
      if (spectrum?.context.state === "suspended") {
        void spectrum.context.resume().catch(() => undefined);
      }
    };
    document.addEventListener("playing", activate, true);
    activate();
    const render = () => {
      if (frame % 30 === 0) colors = visualizerColors(canvas);
      const active = Boolean(
        activeMedia &&
          !activeMedia.paused &&
          !activeMedia.ended &&
          !activeMedia.error &&
          activeMedia.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA,
      );
      if (active && spectrum?.context.state === "running") {
        spectrum.analyser.getByteFrequencyData(spectrum.data);
      }
      drawBars(context, levels, motion, spectrum?.data ?? null, active, colors, frame);
      frame += 1;
      animation = requestAnimationFrame(render);
    };
    animation = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animation);
      observer.disconnect();
      document.removeEventListener("playing", activate, true);
    };
  }, [media]);

  return <canvas ref={canvasRef} className="typetype-audio-visualizer" />;
}
