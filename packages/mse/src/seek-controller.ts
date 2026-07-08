export type SeekExecutor = (positionMs: number) => Promise<void>;

export class SeekController {
  private requestedMs: number | null = null;
  private running: Promise<void> | null = null;

  seek(positionMs: number, execute: SeekExecutor): Promise<void> {
    this.requestedMs = Math.max(0, Math.round(positionMs));
    if (!this.running) this.running = this.drain(execute).finally(() => (this.running = null));
    return this.running;
  }

  reset(): void {
    this.requestedMs = null;
  }

  private async drain(execute: SeekExecutor): Promise<void> {
    while (this.requestedMs !== null) {
      const target = this.requestedMs;
      this.requestedMs = null;
      try {
        await execute(target);
      } catch (error) {
        if (!isAbortError(error) || this.requestedMs === null) throw error;
      }
    }
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === "AbortError"
    : error instanceof Error && error.name === "AbortError";
}
