type QueueItem = {
  action: () => void;
  resolve: () => void;
  reject: (error: Error) => void;
};

export class AppendQueue {
  private readonly queue: QueueItem[] = [];
  private current: QueueItem | null = null;
  private disposed = false;

  constructor(private readonly sourceBuffer: SourceBuffer) {
    sourceBuffer.addEventListener("updateend", this.handleUpdateEnd);
    sourceBuffer.addEventListener("error", this.handleError);
  }

  append(data: ArrayBuffer): Promise<void> {
    if (this.disposed) return Promise.reject(new Error("Append queue is disposed"));
    return new Promise((resolve, reject) => {
      this.queue.push({ action: () => this.sourceBuffer.appendBuffer(data), resolve, reject });
      this.drain();
    });
  }

  remove(startSeconds: number, endSeconds: number): Promise<void> {
    if (this.disposed) return Promise.reject(new Error("Append queue is disposed"));
    if (endSeconds <= startSeconds) return Promise.resolve();
    return new Promise((resolve, reject) => {
      this.queue.push({
        action: () => this.sourceBuffer.remove(startSeconds, endSeconds),
        resolve,
        reject,
      });
      this.drain();
    });
  }

  clear(): void {
    this.queue.splice(0);
    this.current = null;
    if (this.sourceBuffer.updating) this.sourceBuffer.abort();
  }

  destroy(): void {
    this.disposed = true;
    this.clear();
    this.sourceBuffer.removeEventListener("updateend", this.handleUpdateEnd);
    this.sourceBuffer.removeEventListener("error", this.handleError);
  }

  private readonly handleUpdateEnd = (): void => {
    this.current?.resolve();
    this.current = null;
    this.drain();
  };

  private readonly handleError = (): void => {
    this.current?.reject(new Error("SourceBuffer append failed"));
    this.current = null;
    this.drain();
  };

  private drain(): void {
    if (this.disposed || this.current || this.sourceBuffer.updating) return;
    const item = this.queue.shift();
    if (!item) return;
    this.current = item;
    try {
      item.action();
    } catch (error) {
      item.reject(error instanceof Error ? error : new Error("SourceBuffer append failed"));
      this.current = null;
      this.drain();
    }
  }
}
