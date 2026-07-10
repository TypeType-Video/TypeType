export type AudioSpectrum = {
  analyser: AnalyserNode;
  context: AudioContext;
  data: Uint8Array<ArrayBuffer>;
};

const spectra = new WeakMap<HTMLMediaElement, AudioSpectrum>();

export function audioSpectrum(media: HTMLMediaElement): AudioSpectrum | null {
  const existing = spectra.get(media);
  if (existing) return existing;
  try {
    const context = new AudioContext();
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
    };
    spectra.set(media, spectrum);
    return spectrum;
  } catch {
    return null;
  }
}

export function waveformLevel(data: Uint8Array, index: number, total: number): number {
  if (data.length === 0 || total <= 1) return 0;
  const position = index / (total - 1);
  const center = Math.min(data.length - 1, Math.round(position * (data.length - 1)));
  const radius = Math.max(1, Math.floor(data.length / total / 2));
  let peak = 0;
  for (let sample = Math.max(0, center - radius); sample <= center + radius; sample += 1) {
    peak = Math.max(peak, Math.abs((data[sample] ?? 128) - 128) / 128);
  }
  return Math.min(1, peak * 2.4);
}
