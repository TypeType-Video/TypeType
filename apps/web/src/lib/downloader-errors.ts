import { ApiError } from "./api";

export const DOWNLOADER_INSUFFICIENT_STORAGE_CODE = "insufficient_storage";
export const DOWNLOADER_INSUFFICIENT_STORAGE_MESSAGE =
  "Stockage temporairement sature, reessayez plus tard.";
export const DOWNLOADER_INSUFFICIENT_STORAGE_HELP =
  "Si le probleme persiste, contactez l'administrateur de l'instance avec le code : insufficient_storage (HTTP 507).";

export class DownloaderApiError extends ApiError {
  code: string | null;

  constructor(message: string, status: number, code: string | null) {
    super(message, status);
    this.name = "DownloaderApiError";
    this.code = code;
  }
}

export function normalizeDownloaderErrorCode(status: number, code: string | null): string | null {
  if (status === 507 || code === DOWNLOADER_INSUFFICIENT_STORAGE_CODE) {
    return DOWNLOADER_INSUFFICIENT_STORAGE_CODE;
  }
  return code;
}

export function downloaderErrorCode(error: Error | null): string | null {
  return error instanceof DownloaderApiError ? error.code : null;
}
