import type { VideoStream } from "../types/stream";

export type WatchLayoutProps = {
  stream: VideoStream;
  startTime: number;
  currentParam: string;
  navigating: boolean;
  list?: string;
  shuffle?: string;
};
