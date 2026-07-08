export type SabrVidstackControls = {
  play: () => Promise<void>;
  pause: () => void;
  seek: (seconds: number) => void;
};

const controlsByVideo = new WeakMap<HTMLVideoElement, SabrVidstackControls>();

export function registerSabrVidstackControls(
  video: HTMLVideoElement,
  controls: SabrVidstackControls,
): () => void {
  controlsByVideo.set(video, controls);
  return () => {
    if (controlsByVideo.get(video) === controls) controlsByVideo.delete(video);
  };
}

export function getSabrVidstackControls(video: HTMLVideoElement): SabrVidstackControls | null {
  return controlsByVideo.get(video) ?? null;
}
