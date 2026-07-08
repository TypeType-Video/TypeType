import type { TypeTypeMseState } from "./types";

type MediaElementObserverArgs = {
  video: HTMLVideoElement;
  state: (state: TypeTypeMseState) => void;
  error: (error: Error) => void;
};

export class MediaElementObserver {
  constructor(private readonly args: MediaElementObserverArgs) {}

  start(): void {
    this.args.video.addEventListener("playing", this.playing);
    this.args.video.addEventListener("waiting", this.buffering);
    this.args.video.addEventListener("stalled", this.buffering);
    this.args.video.addEventListener("ended", this.ended);
    this.args.video.addEventListener("error", this.error);
  }

  stop(): void {
    this.args.video.removeEventListener("playing", this.playing);
    this.args.video.removeEventListener("waiting", this.buffering);
    this.args.video.removeEventListener("stalled", this.buffering);
    this.args.video.removeEventListener("ended", this.ended);
    this.args.video.removeEventListener("error", this.error);
  }

  private readonly playing = (): void => this.args.state("playing");

  private readonly buffering = (): void => this.args.state("buffering");

  private readonly ended = (): void => this.args.state("ended");

  private readonly error = (): void => {
    const code = this.args.video.error?.code ?? 0;
    this.args.error(new Error(`Media element failed with code ${code}`));
  };
}
