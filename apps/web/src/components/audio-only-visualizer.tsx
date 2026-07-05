import { useEffect, useRef } from "react";
import { useMediaState } from "../lib/vidstack";

type VisualizerColors = {
  top: string;
  mid: string;
  bottom: string;
};

function resizeCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * scale));
  canvas.height = Math.max(1, Math.floor(rect.height * scale));
}

function drawBars(
  context: CanvasRenderingContext2D,
  levels: Float32Array,
  tick: number,
  active: boolean,
  colors: VisualizerColors,
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

  for (let index = 0; index < bars; index += 1) {
    const pulse = (Math.sin(tick * 0.0026 + index * 0.34) + 1) / 2;
    const drift = (Math.sin(tick * 0.0018 + index * 0.11) + 1) / 2;
    const target = active ? 0.12 + pulse * 0.28 + drift * 0.08 : 0.035 + pulse * 0.055;
    levels[index] += (target - levels[index]) * (active ? 0.16 : 0.08);
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

export function AudioOnlyVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paused = useMediaState("paused");
  const canPlay = useMediaState("canPlay");

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    resizeCanvas(canvas);
    const observer = new ResizeObserver(() => resizeCanvas(canvas));
    observer.observe(canvas);
    const levels = new Float32Array(112);
    let colors = visualizerColors(canvas);
    let animation = 0;
    let frame = 0;
    const render = (time: number) => {
      if (frame % 30 === 0) colors = visualizerColors(canvas);
      drawBars(context, levels, time, !paused && canPlay, colors);
      frame += 1;
      animation = requestAnimationFrame(render);
    };
    animation = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animation);
      observer.disconnect();
    };
  }, [canPlay, paused]);

  return <canvas ref={canvasRef} className="typetype-audio-visualizer" />;
}
