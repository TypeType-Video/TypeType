import { useCallback, useMemo } from "react";
import type { ChannelResultItem } from "../types/api";
import type { PublicPlaylistInfo } from "../types/playlist";
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
  const blockedChannelNames = useMemo(
    () => new Set((channels.data ?? []).map((item) => item.name?.toLowerCase()).filter(Boolean)),
    [channels.data],
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

  const isChannelBlocked = useCallback(
    (channel: ChannelResultItem): boolean => blockedChannelUrls.has(channel.url),
    [blockedChannelUrls],
  );

  const isPlaylistBlocked = useCallback(
    (playlist: PublicPlaylistInfo): boolean => {
      const uploader = playlist.uploaderName.trim().toLowerCase();
      return uploader.length > 0 && blockedChannelNames.has(uploader);
    },
    [blockedChannelNames],
  );

  return {
    filter,
    isBlocked,
    isChannelBlocked,
    isPlaylistBlocked,
    blockedChannelUrls,
    blockedVideoUrls,
  };
}
