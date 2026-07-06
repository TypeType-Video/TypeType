export class SabrSourceBufferQueue {
  private readonly queue: Uint8Array<ArrayBuffer>[] = [];
  private readonly buffer: SourceBuffer;
  private failed = false;

  constructor(buffer: SourceBuffer) {
    this.buffer = buffer;
    this.buffer.addEventListener("updateend", () => this.drain());
    this.buffer.addEventListener("error", () => {
      this.failed = true;
    });
  }

  append(bytes: Uint8Array<ArrayBuffer>): void {
    if (this.failed) throw new Error("source_buffer_failed");
    this.queue.push(bytes);
    this.drain();
  }

  clear(): void {
    this.queue.length = 0;
  }

  idle(): boolean {
    return this.queue.length === 0 && !this.buffer.updating;
  }

  removeBefore(time: number): void {
    if (this.buffer.updating || time <= 10) return;
    try {
      this.buffer.remove(0, Math.max(0, time - 8));
    } catch {
      this.failed = true;
    }
  }

  private drain(): void {
    if (this.failed || this.buffer.updating || this.queue.length === 0) return;
    const next = this.queue.shift();
    if (!next) return;
    try {
      this.buffer.appendBuffer(next);
    } catch (error) {
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        this.queue.unshift(next);
        return;
      }
      this.failed = true;
      throw error;
    }
  }
}
