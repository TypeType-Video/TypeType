import { create } from "zustand";
import type { VideoStream } from "../types/stream";

type WatchNavigationSnapshot = {
  stream: VideoStream;
  relatedStreams: VideoStream[];
};

type WatchNavigationStore = {
  snapshot: WatchNavigationSnapshot | null;
  setNavigation: (stream: VideoStream, relatedStreams?: VideoStream[]) => void;
};

export const useWatchNavigationStore = create<WatchNavigationStore>((set) => ({
  snapshot: null,
  setNavigation: (stream, relatedStreams = []) =>
    set({
      snapshot: {
        stream,
        relatedStreams: relatedStreams.filter((item) => item.id !== stream.id).slice(0, 20),
      },
    }),
}));
