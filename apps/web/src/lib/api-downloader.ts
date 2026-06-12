import type {
  DownloaderCreateJobRequest,
  DownloaderCreateJobResponse,
  DownloaderJobResponse,
} from "../types/downloader";
import { ApiError } from "./api";
import {
  DOWNLOADER_INSUFFICIENT_STORAGE_CODE,
  DOWNLOADER_INSUFFICIENT_STORAGE_MESSAGE,
  DownloaderApiError,
  normalizeDownloaderErrorCode,
} from "./downloader-errors";
import { API_BASE as BASE } from "./env";
import { isIosWebKitBrowser } from "./ios-device";

type DownloadArtifactOptions = {
  preferShare?: boolean;
};

const CANCEL_POLL_DELAY_MS = 300;
const CANCEL_POLL_ATTEMPTS = 8;

async function readJson(res: Response): Promise<unknown> {
  return res.json().catch(() => ({}));
}

function readStringField(body: unknown, field: "code" | "error" | "message"): string | null {
  if (!body || typeof body !== "object") return null;
  let value: unknown;
  if (field === "code" && "code" in body) value = body.code;
  if (field === "error" && "error" in body) value = body.error;
  if (field === "message" && "message" in body) value = body.message;
  return typeof value === "string" && value.length > 0 ? value : null;
}

function readErrorMessage(body: unknown, fallback: string): string {
  return readStringField(body, "error") ?? readStringField(body, "message") ?? fallback;
}

function readDownloaderError(body: unknown, status: number, fallback: string): DownloaderApiError {
  const code = normalizeDownloaderErrorCode(status, readStringField(body, "code"));
  const message =
    code === DOWNLOADER_INSUFFICIENT_STORAGE_CODE
      ? DOWNLOADER_INSUFFICIENT_STORAGE_MESSAGE
      : readErrorMessage(body, fallback);
  return new DownloaderApiError(message, status, code);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function createDownloaderJob(
  payload: DownloaderCreateJobRequest,
): Promise<DownloaderCreateJobResponse> {
  const res = await fetch(`${BASE}/downloader/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await readJson(res);
  if (!res.ok) {
    throw readDownloaderError(body, res.status, "Failed to create download job");
  }
  return body as DownloaderCreateJobResponse;
}

export async function fetchDownloaderJob(jobId: string): Promise<DownloaderJobResponse> {
  const res = await fetch(`${BASE}/downloader/jobs/${encodeURIComponent(jobId)}`);
  const body = await readJson(res);
  if (!res.ok) {
    throw new ApiError(readErrorMessage(body, "Failed to fetch download job"), res.status);
  }
  return body as DownloaderJobResponse;
}

export async function cancelDownloaderJob(jobId: string): Promise<DownloaderJobResponse> {
  const res = await fetch(`${BASE}/downloader/jobs/${encodeURIComponent(jobId)}/cancel`, {
    method: "POST",
  });
  const body = await readJson(res);
  if (!res.ok) {
    throw new ApiError(readErrorMessage(body, "Failed to cancel download job"), res.status);
  }
  for (let attempt = 0; attempt < CANCEL_POLL_ATTEMPTS; attempt += 1) {
    const job = await fetchDownloaderJob(jobId);
    if (job.status !== "queued" && job.status !== "running") return job;
    await delay(CANCEL_POLL_DELAY_MS);
  }
  return fetchDownloaderJob(jobId);
}

export async function deleteDownloaderJob(jobId: string): Promise<void> {
  const res = await fetch(`${BASE}/downloader/jobs/${encodeURIComponent(jobId)}`, {
    method: "DELETE",
  });
  if (res.ok || res.status === 404) return;
  const body = await readJson(res);
  throw new ApiError(readErrorMessage(body, "Failed to delete download job"), res.status);
}

function extensionFromType(contentType: string | null): string {
  const value = contentType ?? "";
  if (value.includes("video/mp4")) return "mp4";
  if (value.includes("audio/mpeg")) return "mp3";
  if (value.includes("audio/webm")) return "webm";
  if (value.includes("audio/mp4")) return "m4a";
  return "bin";
}

function filenameFromHeader(contentDisposition: string | null): string | null {
  const value = contentDisposition ?? "";
  const utf8 = value.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8?.[1]) return decodeURIComponent(utf8[1]);
  const classic = value.match(/filename="?([^";]+)"?/i);
  return classic?.[1] ?? null;
}

function canUseShareApi(): boolean {
  if (typeof navigator === "undefined") return false;
  return typeof navigator.share === "function";
}

function supportsFileShare(data: ShareData): boolean {
  if (typeof navigator === "undefined") return false;
  if (typeof navigator.canShare !== "function") return false;
  return navigator.canShare(data);
}

function fallbackFileName(jobId: string, headers: Headers): string {
  return (
    filenameFromHeader(headers.get("content-disposition")) ??
    `typetype-download-${jobId}.${extensionFromType(headers.get("content-type"))}`
  );
}

async function shareDownloaderArtifact(endpoint: string, jobId: string): Promise<void> {
  const res = await fetch(endpoint);
  if (!res.ok) {
    const body = await readJson(res);
    throw new ApiError(readErrorMessage(body, "Failed to download artifact"), res.status);
  }
  const blob = await res.blob();
  const fileName = fallbackFileName(jobId, res.headers);
  const fileType = blob.type.length > 0 ? blob.type : "application/octet-stream";
  const file = new File([blob], fileName, { type: fileType });
  const shareData: ShareData = { files: [file], title: fileName };
  if (!supportsFileShare(shareData)) {
    throw new ApiError("Native iOS share is unavailable for this file", 422);
  }
  await navigator.share(shareData);
}

function openArtifactLocation(endpoint: string): void {
  window.location.assign(endpoint);
}

export function canUseIosShareFlow(): boolean {
  return isIosWebKitBrowser() && canUseShareApi();
}

export async function downloadDownloaderArtifact(
  jobId: string,
  options: DownloadArtifactOptions = {},
): Promise<void> {
  const endpoint = `${BASE}/downloader/jobs/${encodeURIComponent(jobId)}/artifact`;
  if (options.preferShare && canUseIosShareFlow()) {
    await shareDownloaderArtifact(endpoint, jobId);
    return;
  }
  openArtifactLocation(endpoint);
}
