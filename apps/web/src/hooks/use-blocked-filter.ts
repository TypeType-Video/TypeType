import { useCallback, useMemo } from "react";
import type { VideoStream } from "../types/stream";
import { useAuth } from "./use-auth";
import { useBlocked } from "./use-blocked";

export function useBlockedFilter() {
  const { isAuthed } = useAuth();
  const { channels, videos } = useBlocked();

  const blockedChannelUrls = useMemo(
    () => new Set((channels.data ?? []).map((item) => item.url)),
    [channels.data],
  );
  const blockedVideoUrls = useMemo(
    () => new Set((videos.data ?? []).map((item) => item.url)),
    [videos.data],
  );

  const isBlocked = useCallback(
    (stream: VideoStream): boolean => {
      if (blockedVideoUrls.has(stream.id)) return true;
      if (stream.channelUrl && blockedChannelUrls.has(stream.channelUrl)) return true;
      return false;
    },
    [blockedChannelUrls, blockedVideoUrls],
  );

  const filter = useCallback(
    (streams: VideoStream[]): VideoStream[] => {
      if (!isAuthed) return streams;
      return streams.filter((s) => !isBlocked(s));
    },
    [isAuthed, isBlocked],
  );

  return { filter, isBlocked, blockedChannelUrls, blockedVideoUrls };
}
