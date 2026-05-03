type YoutubeTakeoutImportStatus = "pending" | "running" | "completed" | "failed";

export type YoutubeTakeoutImportJob = {
  jobId: string;
  status: YoutubeTakeoutImportStatus;
  phase?: string;
  progress?: number;
  error?: string | null;
};

export type YoutubeTakeoutPreview = {
  counts: {
    subscriptions: number;
    playlists: number;
    playlistItems: number;
    favorites?: number;
    watchLater?: number;
    history?: number;
  };
  dedup?: {
    subscriptions?: number;
    playlists?: number;
    playlistItems?: number;
  };
  warnings?: string[];
  errors?: string[];
};

export type YoutubeTakeoutReportBucket = { imported: number; skipped: number; failed: number };

export type YoutubeTakeoutReport = {
  subscriptions?: YoutubeTakeoutReportBucket;
  playlists?: YoutubeTakeoutReportBucket;
  playlistItems?: YoutubeTakeoutReportBucket;
  history?: YoutubeTakeoutReportBucket;
  watchLater?: YoutubeTakeoutReportBucket;
  favorites?: YoutubeTakeoutReportBucket;
  warnings?: string[];
  errors?: string[];
};
