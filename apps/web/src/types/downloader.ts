export type DownloaderMode = "video" | "audio";

export type DownloaderJobStatus = "queued" | "running" | "done" | "failed";

export type DownloaderJobStage =
  | "queued"
  | "extract"
  | "running"
  | "download"
  | "downloading"
  | "mux"
  | "finalizing"
  | "done"
  | "cached"
  | "cancelled"
  | "failed";

type DownloaderJobOptions = {
  mode: DownloaderMode;
  quality: string;
  format: string;
  videoItag?: string;
  audioItag?: string;
  height?: number;
  fps?: number;
  videoCodec?: string;
  audioCodec?: string;
  bitrate?: number;
  allowQualityFallback?: boolean;
  sponsorBlock: boolean;
  sponsorBlockCategories: string[];
  thumbnailOnly: boolean;
  subtitles: {
    enabled: boolean;
    auto: boolean;
    embed: boolean;
    languages: string[];
    format: "srt" | "vtt";
  };
};

export type DownloaderCreateJobRequest = {
  url: string;
  options: DownloaderJobOptions;
};

export type DownloaderCreateJobResponse = {
  id: string;
  cached: boolean;
};

export type DownloaderResolvedSelection = {
  videoItag?: string | null;
  audioItag?: string | null;
  height?: number | null;
  fps?: number | null;
  videoCodec?: string | null;
  audioCodec?: string | null;
  container?: string | null;
  bitrate?: number | null;
  fileName?: string | null;
};

export type DownloaderJobResponse = {
  id: string;
  status: DownloaderJobStatus;
  stage?: DownloaderJobStage | null;
  progressPercent?: number | null;
  downloadedBytes?: number | null;
  totalBytes?: number | null;
  etaSeconds?: number | null;
  resolved?: DownloaderResolvedSelection | null;
  artifactUrl?: string | null;
  errorCode?: string | null;
  error?: string | null;
  tokenFetchMs?: number | null;
  ytdlpMs?: number | null;
  uploadMs?: number | null;
  totalMs?: number | null;
};
