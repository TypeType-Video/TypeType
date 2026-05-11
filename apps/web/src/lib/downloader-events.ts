import type { DownloaderJobResponse } from "../types/downloader";
import { API_BASE as BASE } from "./env";

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return value;
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toStage(value: unknown): DownloaderJobResponse["stage"] {
  if (value === "queued") return "queued";
  if (value === "extract") return "extract";
  if (value === "running") return "running";
  if (value === "download") return "download";
  if (value === "downloading") return "downloading";
  if (value === "mux") return "mux";
  if (value === "finalizing") return "finalizing";
  if (value === "done") return "done";
  if (value === "cached") return "cached";
  if (value === "cancelled") return "cancelled";
  if (value === "failed") return "failed";
  return null;
}

function toResolved(value: unknown): DownloaderJobResponse["resolved"] {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  return {
    videoItag: toStringOrNull(item.videoItag),
    audioItag: toStringOrNull(item.audioItag),
    height: toFiniteNumber(item.height),
    fps: toFiniteNumber(item.fps),
    videoCodec: toStringOrNull(item.videoCodec),
    audioCodec: toStringOrNull(item.audioCodec),
    container: toStringOrNull(item.container),
    bitrate: toFiniteNumber(item.bitrate),
    fileName: toStringOrNull(item.fileName),
  };
}

function toStatus(value: unknown): DownloaderJobResponse["status"] {
  return value === "queued" || value === "running" || value === "done" || value === "failed"
    ? value
    : "failed";
}

function parseEventPayload(raw: string): DownloaderJobResponse | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const value = parsed as Record<string, unknown>;
  const id = toStringOrNull(value.id);
  if (!id) return null;
  return {
    id,
    status: toStatus(value.status),
    stage: toStage(value.stage),
    progressPercent: toFiniteNumber(value.progressPercent),
    downloadedBytes: toFiniteNumber(value.downloadedBytes),
    totalBytes: toFiniteNumber(value.totalBytes),
    etaSeconds: toFiniteNumber(value.etaSeconds),
    errorCode: toStringOrNull(value.errorCode),
    error: toStringOrNull(value.error),
    tokenFetchMs: toFiniteNumber(value.tokenFetchMs),
    ytdlpMs: toFiniteNumber(value.ytdlpMs),
    uploadMs: toFiniteNumber(value.uploadMs),
    totalMs: toFiniteNumber(value.totalMs),
    resolved: toResolved(value.resolved),
  };
}

export function subscribeDownloaderEvents(
  jobId: string,
  handlers: {
    onMessage: (next: DownloaderJobResponse) => void;
    onError: () => void;
  },
): () => void {
  let closed = false;
  const url = `${BASE}/downloader/jobs/${encodeURIComponent(jobId)}/events`;
  const eventSource = new EventSource(url, { withCredentials: false });
  const onProgress = (event: Event) => {
    if (!(event instanceof MessageEvent) || typeof event.data !== "string") return;
    const next = parseEventPayload(event.data);
    if (!next) return;
    handlers.onMessage(next);
    if (next.status === "done" || next.status === "failed") {
      closed = true;
      eventSource.close();
    }
  };
  eventSource.addEventListener("progress", onProgress);
  eventSource.addEventListener("message", onProgress);
  eventSource.onerror = () => {
    if (closed) return;
    handlers.onError();
    closed = true;
    eventSource.close();
  };
  return () => {
    closed = true;
    eventSource.removeEventListener("progress", onProgress);
    eventSource.removeEventListener("message", onProgress);
    eventSource.close();
  };
}
