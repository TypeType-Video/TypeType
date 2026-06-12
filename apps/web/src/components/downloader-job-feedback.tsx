import {
  DOWNLOADER_STEPS,
  downloaderProgressValue,
  downloaderStageIndex,
  downloaderStatusLabel,
  downloaderStatusMessage,
  isCancelledDownloaderJob,
  isFailedDownloaderJob,
  shouldShowDownloaderProgress,
} from "../lib/downloader-display";
import { DOWNLOADER_INSUFFICIENT_STORAGE_CODE } from "../lib/downloader-errors";
import type {
  DownloaderJobStage,
  DownloaderJobStatus,
  DownloaderResolvedSelection,
} from "../types/downloader";
import { DownloaderStorageError } from "./downloader-storage-error";

type Props = {
  status: DownloaderJobStatus | null;
  stage: DownloaderJobStage | null;
  progressPercent: number | null;
  resolved: DownloaderResolvedSelection | null;
  errorCode: string | null;
  errorText: string | null;
  immersive?: boolean;
  forceWaiting?: boolean;
  canCancel?: boolean;
  cancelPending?: boolean;
  onCancel?: () => void;
  canClear?: boolean;
  clearPending?: boolean;
  onClear?: () => void;
};

function formatResolved(resolved: DownloaderResolvedSelection | null): string | null {
  if (!resolved) return null;
  const quality =
    typeof resolved.height === "number"
      ? `${resolved.height}p`
      : typeof resolved.bitrate === "number"
        ? `${Math.round(resolved.bitrate)} kbps`
        : null;
  const container =
    typeof resolved.container === "string" && resolved.container.length > 0
      ? resolved.container.toUpperCase()
      : null;
  if (!quality && !container) return null;
  return [quality, container].filter((item) => item !== null).join(" ");
}

function exactUnavailableMessage(resolved: DownloaderResolvedSelection | null): string {
  if (typeof resolved?.height === "number") {
    return `Requested ${resolved.height}p is unavailable. Pick another format.`;
  }
  return "Selected format is unavailable. Pick another format.";
}

export function DownloaderJobFeedback({
  status,
  stage,
  progressPercent,
  resolved,
  errorCode,
  errorText,
  immersive = false,
  forceWaiting = false,
  canCancel = false,
  cancelPending = false,
  onCancel,
  canClear = false,
  clearPending = false,
  onClear,
}: Props) {
  const resolvedLabel = formatResolved(resolved);
  const visibleError =
    errorCode === "exact_selection_unavailable"
      ? exactUnavailableMessage(resolved)
      : (errorText ?? null);
  const cancelled = isCancelledDownloaderJob(status, stage, errorCode);
  const failed = isFailedDownloaderJob(status, stage, errorCode);
  const label = downloaderStatusLabel(status, stage, errorCode, forceWaiting);
  const message = downloaderStatusMessage(status, stage, errorCode, visibleError, forceWaiting);
  const insufficientStorage = errorCode === DOWNLOADER_INSUFFICIENT_STORAGE_CODE;
  const progress = downloaderProgressValue(status, stage, progressPercent, forceWaiting);
  const activeStep = downloaderStageIndex(status, stage);
  const showCancel = canCancel && !cancelled && !failed && typeof onCancel === "function";
  const showClear = canClear && typeof onClear === "function";
  const showProgress = shouldShowDownloaderProgress(status, forceWaiting) && !failed && !cancelled;
  const showPercent = typeof progressPercent === "number" && status === "running";

  if (!status && !forceWaiting && !resolvedLabel && !visibleError) return null;

  return (
    <section
      className={`mt-3 rounded-2xl border p-3 ${immersive ? "bg-surface/80" : "bg-surface/60"} ${failed ? "border-danger/50" : "border-border-strong"}`}
      role={failed ? "alert" : "status"}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-fg">{label}</p>
          <p className={`mt-1 text-xs ${failed ? "text-danger-strong" : "text-fg-muted"}`}>
            {message}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {showPercent && (
            <span className="text-sm font-semibold text-fg">{Math.round(progress)}%</span>
          )}
          {showCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={cancelPending}
              className="rounded-full border border-border px-2 py-1 text-[11px] font-medium text-fg-muted hover:border-border-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelPending ? "Cancelling..." : "Cancel"}
            </button>
          )}
          {showClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={clearPending}
              className="rounded-full border border-border px-2 py-1 text-[11px] font-medium text-fg-muted hover:border-border-strong hover:text-fg disabled:cursor-not-allowed disabled:opacity-60"
            >
              {clearPending ? "Clearing..." : "Clear"}
            </button>
          )}
        </div>
      </div>
      {insufficientStorage && <DownloaderStorageError />}
      {showProgress && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-app">
          <div
            className="h-full rounded-full bg-fg transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {status === "running" && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {DOWNLOADER_STEPS.map((step, index) => (
            <div key={step} className="flex items-center gap-2 text-[11px] text-fg-muted">
              <span
                className={`h-2 w-2 rounded-full ${index <= activeStep ? "bg-fg" : "bg-surface-soft"}`}
              />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
      {resolvedLabel && !failed && (
        <p className="mt-3 truncate text-xs text-fg-soft">Selected: {resolvedLabel}</p>
      )}
    </section>
  );
}
