import { DOWNLOADER_INSUFFICIENT_STORAGE_HELP } from "../lib/downloader-errors";

export function DownloaderStorageError() {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-xl border border-danger/20 bg-app/60 p-2">
      <img
        src="/downloader-waiting.gif"
        alt=""
        className="h-20 w-20 rounded-xl object-cover motion-reduce:hidden"
      />
      <p className="text-xs leading-relaxed text-fg-muted">
        {DOWNLOADER_INSUFFICIENT_STORAGE_HELP}
      </p>
    </div>
  );
}
