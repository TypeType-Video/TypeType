export type AudioSpectrum = {
  analyser: AnalyserNode;
  context: AudioContext;
  data: Uint8Array<ArrayBuffer>;
  source: MediaElementAudioSourceNode;
};

const spectra = new WeakMap<HTMLMediaElement, AudioSpectrum>();
let sharedContext: AudioContext | null = null;

export function prepareAudioSpectrum(): void {
  sharedContext ??= new AudioContext();
  if (sharedContext.state === "suspended") void sharedContext.resume().catch(() => undefined);
}

export function audioSpectrum(media: HTMLMediaElement): AudioSpectrum | null {
  const existing = spectra.get(media);
  if (existing) return existing;
  try {
    sharedContext ??= new AudioContext();
    const context = sharedContext;
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -18;
    analyser.smoothingTimeConstant = 0.78;
    const source = context.createMediaElementSource(media);
    source.connect(analyser);
    analyser.connect(context.destination);
    const spectrum = {
      analyser,
      context,
      data: new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount)),
      source,
    };
    spectra.set(media, spectrum);
    return spectrum;
  } catch {
    return null;
  }
}

export function waveformEnergy(data: Uint8Array): number {
  if (data.length === 0) return 0;
  const usefulLength = Math.max(1, Math.floor(data.length * 0.72));
  let peak = 0;
  let squares = 0;
  for (let index = 0; index < usefulLength; index += 1) {
    const sample = (data[index] ?? 0) / 255;
    peak = Math.max(peak, sample);
    squares += sample * sample;
  }
  const rms = Math.sqrt(squares / usefulLength);
  return Math.min(1, Math.max(peak * 0.7, rms * 1.9));
}

export function waveformLevel(
  data: Uint8Array,
  index: number,
  total: number,
  energy = waveformEnergy(data),
): number {
  if (data.length === 0 || total <= 1) return 0;
  const position = Math.abs((index / (total - 1)) * 2 - 1);
  const center = Math.min(data.length - 1, Math.round(position * (data.length - 1)));
  const radius = Math.max(1, Math.floor(data.length / total / 2));
  let peak = 0;
  for (let sample = Math.max(0, center - radius); sample <= center + radius; sample += 1) {
    peak = Math.max(peak, (data[sample] ?? 0) / 255);
  }
  const spread = energy * (0.46 + (1 - position) * 0.28);
  return Math.min(1, Math.max(peak * 1.8, spread));
}
