export type SabrVidstackControls = {
  play: () => Promise<void>;
  pause: (userInitiated?: boolean) => void;
  seek: (seconds: number) => void;
};

const controlsByVideo = new WeakMap<HTMLVideoElement, SabrVidstackControls>();
const pendingPlaybackByVideo = new WeakMap<HTMLVideoElement, boolean>();

export function registerSabrVidstackControls(
  video: HTMLVideoElement,
  controls: SabrVidstackControls,
): () => void {
  controlsByVideo.set(video, controls);
  const pendingPlayback = pendingPlaybackByVideo.get(video);
  pendingPlaybackByVideo.delete(video);
  if (pendingPlayback === true) void controls.play().catch(() => {});
  else if (pendingPlayback === false) controls.pause();
  return () => {
    if (controlsByVideo.get(video) === controls) controlsByVideo.delete(video);
  };
}

function getSabrVidstackControls(video: HTMLVideoElement): SabrVidstackControls | null {
  return controlsByVideo.get(video) ?? null;
}

export function requestSabrSeek(video: HTMLVideoElement, seconds: number): boolean {
  const controls = getSabrVidstackControls(video);
  if (!controls) return false;
  controls.seek(seconds);
  return true;
}

export function requestSabrVidstackPlayback(
  video: HTMLVideoElement,
  playing: boolean,
  userInitiated = false,
): Promise<void> {
  const controls = getSabrVidstackControls(video);
  video.autoplay = playing;
  if (!controls) {
    pendingPlaybackByVideo.set(video, playing);
    if (!playing) video.pause();
    return Promise.resolve();
  }
  pendingPlaybackByVideo.delete(video);
  if (playing) return controls.play();
  controls.pause(userInitiated);
  return Promise.resolve();
}
