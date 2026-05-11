import type { DownloaderJobStage, DownloaderJobStatus } from "../types/downloader";

export const DOWNLOADER_STEPS = ["Prepare", "Download", "Finalize"];

export function isCancelledDownloaderJob(
  status: DownloaderJobStatus | null,
  stage: DownloaderJobStage | null,
  errorCode: string | null,
): boolean {
  return (status === "failed" && errorCode === "cancelled") || stage === "cancelled";
}

export function isFailedDownloaderJob(
  status: DownloaderJobStatus | null,
  stage: DownloaderJobStage | null,
  errorCode: string | null,
): boolean {
  return (
    (status === "failed" || stage === "failed") &&
    !isCancelledDownloaderJob(status, stage, errorCode)
  );
}

export function downloaderStageIndex(
  status: DownloaderJobStatus | null,
  stage: DownloaderJobStage | null,
): number {
  if (status === "done" || stage === "done") return 3;
  if (stage === "download" || stage === "downloading") return 1;
  if (stage === "mux" || stage === "finalizing") return 2;
  if (status === "running" || stage === "extract" || stage === "running") return 0;
  return -1;
}

export function downloaderStatusLabel(
  status: DownloaderJobStatus | null,
  stage: DownloaderJobStage | null,
  errorCode: string | null,
  forceWaiting: boolean,
): string {
  if (forceWaiting) return "Opening file";
  if (isCancelledDownloaderJob(status, stage, errorCode)) return "Cancelled";
  if (isFailedDownloaderJob(status, stage, errorCode)) return "Failed";
  if (stage === "cached") return "Ready from cache";
  if (status === "done" || stage === "done") return "Ready";
  if (status === "queued" || stage === "queued") return "Queued";
  if (stage === "download" || stage === "downloading") return "Downloading";
  if (stage === "mux" || stage === "finalizing") return "Finalizing";
  return "Preparing download";
}

export function downloaderStatusMessage(
  status: DownloaderJobStatus | null,
  stage: DownloaderJobStage | null,
  errorCode: string | null,
  errorText: string | null,
  forceWaiting: boolean,
): string {
  if (forceWaiting) return "Handing the file to your browser.";
  if (isCancelledDownloaderJob(status, stage, errorCode)) return "The download was cancelled.";
  if (isFailedDownloaderJob(status, stage, errorCode))
    return errorText ?? "The download could not be completed.";
  if (stage === "cached") return "Using the cached file.";
  if (status === "done" || stage === "done") return "Your file is ready.";
  if (status === "queued" || stage === "queued") return "Waiting for an available worker.";
  if (stage === "download" || stage === "downloading") return "Downloading the selected media.";
  if (stage === "mux" || stage === "finalizing") return "Combining the final file.";
  return "Preparing streams and selecting the format.";
}

export function downloaderProgressValue(
  status: DownloaderJobStatus | null,
  stage: DownloaderJobStage | null,
  progressPercent: number | null,
  forceWaiting: boolean,
): number {
  if (forceWaiting || status === "done" || stage === "done") return 100;
  if (typeof progressPercent === "number") return Math.min(100, Math.max(0, progressPercent));
  if (status === "running") return 12;
  if (status === "queued") return 4;
  return 0;
}

export function shouldShowDownloaderProgress(
  status: DownloaderJobStatus | null,
  forceWaiting: boolean,
): boolean {
  return forceWaiting || status === "queued" || status === "running" || status === "done";
}
