import { useEffect, useRef } from "react";

type CapturableAudio = HTMLAudioElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

type VisualizerColors = {
  top: string;
  mid: string;
  bottom: string;
};

function mediaStream(audio: HTMLAudioElement): MediaStream | null {
  const capturable = audio as CapturableAudio;
  const stream =
    typeof capturable.captureStream === "function"
      ? capturable.captureStream()
      : typeof capturable.mozCaptureStream === "function"
        ? capturable.mozCaptureStream()
        : null;
  if (!stream || stream.getAudioTracks().length === 0) return null;
  return stream;
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.max(1, Math.floor(rect.width * scale));
  canvas.height = Math.max(1, Math.floor(rect.height * scale));
}

function drawBars(
  context: CanvasRenderingContext2D,
  data: Uint8Array | null,
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
    const usableBins = data ? Math.max(1, Math.floor(data.length * 0.58)) : 1;
    const shifted = (index * 23) % bars;
    const sourceIndex = data ? Math.floor((shifted / bars) * usableBins) : index;
    const value = data
      ? ((data[sourceIndex] ?? 0) + (data[(sourceIndex + 3) % usableBins] ?? 0)) / 2
      : 0;
    const pulse = (Math.sin(tick * 0.0026 + index * 0.34) + 1) / 2;
    const target = active ? Math.max(value / 255, pulse * 0.045) : 0.025 + pulse * 0.055;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.closest("[data-media-player]");
    const audio = host?.querySelector("audio");
    const context = canvas?.getContext("2d");
    if (!canvas || !audio || !context) return;

    resizeCanvas(canvas);
    const observer = new ResizeObserver(() => resizeCanvas(canvas));
    observer.observe(canvas);

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let data: Uint8Array<ArrayBuffer> | null = null;

    const connect = () => {
      if (analyser) return;
      const stream = mediaStream(audio);
      if (!stream) return;
      try {
        audioContext = new AudioContext();
        analyser = audioContext.createAnalyser();
        source = audioContext.createMediaStreamSource(stream);
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.9;
        source.connect(analyser);
        data = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount));
        void audioContext.resume();
      } catch {
        analyser = null;
        source = null;
        data = null;
        void audioContext?.close();
        audioContext = null;
      }
    };

    const resume = () => {
      connect();
      void audioContext?.resume();
    };
    audio.addEventListener("canplay", resume);
    audio.addEventListener("play", resume);

    const levels = new Float32Array(112);
    let colors = visualizerColors(canvas);
    let animation = 0;
    let frame = 0;
    const render = (time: number) => {
      if (frame % 60 === 0) connect();
      if (frame % 30 === 0) colors = visualizerColors(canvas);
      if (analyser && data) analyser.getByteFrequencyData(data);
      drawBars(context, data, levels, time, !audio.paused && audio.readyState >= 2, colors);
      frame += 1;
      animation = requestAnimationFrame(render);
    };
    animation = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animation);
      audio.removeEventListener("canplay", resume);
      audio.removeEventListener("play", resume);
      observer.disconnect();
      source?.disconnect();
      void audioContext?.close();
    };
  }, []);

  return <canvas ref={canvasRef} className="typetype-audio-visualizer" />;
}
