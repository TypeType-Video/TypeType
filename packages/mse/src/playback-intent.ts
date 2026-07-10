export class PlaybackIntent {
  private resume = false;

  get shouldResume(): boolean {
    return this.resume;
  }

  capture(paused: boolean, seeking: boolean): void {
    if (!seeking) this.resume = !paused;
  }

  play(): void {
    this.resume = true;
  }

  pause(): void {
    this.resume = false;
  }
}
