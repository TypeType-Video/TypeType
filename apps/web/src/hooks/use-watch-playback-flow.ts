import type { WatchPlaylistItem } from "../types/playlist";
import type { VideoStream } from "../types/stream";
import type { SettingsItem } from "../types/user";
import { useWatchAutoplayPreload } from "./use-watch-autoplay-preload";
import { useWatchEndedNavigation } from "./use-watch-ended-navigation";
import { useWatchPlayerEvents } from "./use-watch-player-events";

type Args = {
  stream: VideoStream;
  settings: SettingsItem;
  settingsReady: boolean;
  isLive: boolean;
  nextParam: string | null;
  nextVideo: WatchPlaylistItem | null;
  list?: string;
  shuffle?: string;
  mutate: (positionMs: number, keepalive: boolean) => void;
  onPlay: () => void;
};

export function useWatchPlaybackFlow(args: Args) {
  const autoplay = useWatchEndedNavigation({
    settingsReady: args.settingsReady,
    autoplay: args.settings.autoplay,
    countdownSeconds: args.settings.autoplayCountdownSeconds,
    skipPlaylistAutoplayScreen: args.settings.skipPlaylistAutoplayScreen,
    hideRelatedVideos: args.settings.hideRelatedVideos,
    nextParam: args.nextParam,
    nextVideo: args.nextVideo,
    list: args.list,
    shuffle: args.shuffle,
    related: args.stream.related,
  });
  const preloadAutoplay = useWatchAutoplayPreload({
    durationMs: args.stream.duration * 1000,
    enabled: args.settingsReady && args.settings.autoplay && !args.isLive,
    target: autoplay.nextTarget,
  });
  const playerEvents = useWatchPlayerEvents({
    stream: args.stream,
    isLive: args.isLive,
    mutate: args.mutate,
    onPlay: args.onPlay,
    onEnded: autoplay.handleEnded,
    onTimeUpdate: preloadAutoplay,
  });
  return { autoplay, playerEvents };
}
