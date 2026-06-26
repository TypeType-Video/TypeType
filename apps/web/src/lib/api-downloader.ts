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
import { isIosStandaloneApp, isIosWebKitBrowser } from "./ios-device";

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

function openArtifactLocation(endpoint: string, preferNewContext = false): void {
  if (preferNewContext) {
    const opened = window.open("about:blank", "_blank");
    if (opened) {
      opened.opener = null;
      opened.location.href = endpoint;
      return;
    }
  }
  window.location.assign(endpoint);
}

export function canUseIosShareFlow(): boolean {
  return isIosWebKitBrowser();
}

export async function downloadDownloaderArtifact(
  jobId: string,
  options: DownloadArtifactOptions = {},
): Promise<void> {
  const endpoint = `${BASE}/downloader/jobs/${encodeURIComponent(jobId)}/artifact`;
  if (options.preferShare && canUseIosShareFlow()) {
    openArtifactLocation(endpoint, !isIosStandaloneApp());
    return;
  }
  openArtifactLocation(endpoint);
}
