import type { SabrMediaChunk, SabrRequestMessage, SabrSegmentMessage } from "../types/sabr";

type Pending = {
  requestId: string;
  chunks: SabrMediaChunk[];
  lastSegment: SabrSegmentMessage | null;
  resolve: (chunks: SabrMediaChunk[]) => void;
  reject: (error: Error) => void;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringField(value: Record<string, unknown>, key: string): string | null {
  const field = value[key];
  return typeof field === "string" ? field : null;
}

function numberField(value: Record<string, unknown>, key: string): number | null {
  const field = value[key];
  return typeof field === "number" && Number.isFinite(field) ? field : null;
}

function booleanField(value: Record<string, unknown>, key: string): boolean | null {
  const field = value[key];
  return typeof field === "boolean" ? field : null;
}

function parseSegment(value: Record<string, unknown>): SabrSegmentMessage | null {
  const itag = numberField(value, "itag");
  const init = booleanField(value, "init");
  const startMs = numberField(value, "startMs");
  const durationMs = numberField(value, "durationMs");
  const length = numberField(value, "length");
  if (itag === null || init === null) return null;
  if (startMs === null || durationMs === null || length === null) return null;
  return {
    type: "segment",
    requestId: stringField(value, "requestId") ?? undefined,
    itag,
    init,
    startMs,
    durationMs,
    length,
  };
}

function bytesFromData(data: ArrayBuffer | Blob): Promise<Uint8Array<ArrayBuffer>> {
  if (data instanceof ArrayBuffer) return Promise.resolve(new Uint8Array(data));
  return data.arrayBuffer().then((buffer) => new Uint8Array(buffer));
}

export class SabrWebSocketClient {
  private socket: WebSocket | null = null;
  private pending: Pending | null = null;
  private readyResolve: (() => void) | null = null;
  private readyReject: ((error: Error) => void) | null = null;
  private readonly url: string;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    if (this.socket) return Promise.resolve();
    const socket = new WebSocket(this.url);
    socket.binaryType = "arraybuffer";
    this.socket = socket;
    socket.addEventListener("message", (event) => this.handleMessage(event.data));
    socket.addEventListener("error", () => this.fail(new Error("sabr_ws_error")));
    socket.addEventListener("close", () => this.fail(new Error("sabr_ws_closed")));
    return new Promise((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;
    });
  }

  send(message: SabrRequestMessage): void {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) throw new Error("sabr_ws_not_open");
    socket.send(JSON.stringify(message));
  }

  request(message: SabrRequestMessage): Promise<SabrMediaChunk[]> {
    const socket = this.socket;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return Promise.reject(new Error("sabr_ws_not_open"));
    }
    if (this.pending) return Promise.reject(new Error("sabr_request_in_flight"));
    return new Promise((resolve, reject) => {
      this.pending = {
        requestId: message.requestId,
        chunks: [],
        lastSegment: null,
        resolve,
        reject,
      };
      socket.send(JSON.stringify(message));
    });
  }

  close(): void {
    this.pending = null;
    this.readyResolve = null;
    this.readyReject = null;
    const socket = this.socket;
    this.socket = null;
    if (socket && socket.readyState < WebSocket.CLOSING) socket.close();
  }

  private handleMessage(data: string | ArrayBuffer | Blob): void {
    if (typeof data === "string") {
      this.handleText(data);
      return;
    }
    void bytesFromData(data).then((bytes) => this.handleBinary(bytes));
  }

  private handleText(text: string): void {
    const parsed: unknown = JSON.parse(text);
    if (!isRecord(parsed)) return;
    const type = stringField(parsed, "type");
    if (type === "ready") {
      this.readyResolve?.();
      this.readyResolve = null;
      this.readyReject = null;
      return;
    }
    if (type === "segment") {
      const segment = parseSegment(parsed);
      if (segment && this.pending) this.pending.lastSegment = segment;
      return;
    }
    if (type === "done") {
      const pending = this.pending;
      this.pending = null;
      pending?.resolve(pending.chunks);
      return;
    }
    if (type === "error") {
      this.rejectPending(stringField(parsed, "message") ?? "sabr_ws_protocol_error");
    }
  }

  private handleBinary(bytes: Uint8Array<ArrayBuffer>): void {
    const pending = this.pending;
    const segment = pending?.lastSegment;
    if (!pending || !segment) return;
    pending.chunks.push({ metadata: segment, bytes });
    pending.lastSegment = null;
  }

  private rejectPending(message: string): void {
    const pending = this.pending;
    this.pending = null;
    pending?.reject(new Error(message));
  }

  private fail(error: Error): void {
    this.readyReject?.(error);
    this.readyResolve = null;
    this.readyReject = null;
    const pending = this.pending;
    this.pending = null;
    pending?.reject(error);
  }
}
