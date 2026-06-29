type Args = {
  streamId: string;
  retryKey: number;
  sourceKey: string;
  highQuality: boolean;
  hasThumbnails: boolean;
  hasChapters: boolean;
};

export function buildWatchPlayerKey(args: Args) {
  const quality = args.highQuality ? "hq" : "std";
  const thumbnails = args.hasThumbnails ? "thumbs" : "no-thumbs";
  const chapters = args.hasChapters ? "chapters" : "no-chapters";
  return [args.streamId, args.retryKey, args.sourceKey, quality, thumbnails, chapters].join(":");
}
