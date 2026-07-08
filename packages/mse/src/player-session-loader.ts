import type { PlayerDeps } from "./player-deps";
import { type LoadedSession, loadPlaybackSession } from "./session-loader";
import type { TypeTypeMseConfig, TypeTypeMseQuality } from "./types";

type Args = {
  deps: PlayerDeps;
  config: TypeTypeMseConfig;
  video: HTMLVideoElement;
  response: LoadedSession["response"];
  current: LoadedSession | null;
  quality: TypeTypeMseQuality | undefined;
  startTimeMs: number;
  signal: AbortSignal;
};

export function loadPlayerSession(args: Args): Promise<LoadedSession> {
  return loadPlaybackSession({
    playback: args.deps.playback,
    media: args.deps.media,
    scheduler: args.deps.scheduler,
    video: args.video,
    response: args.response,
    videoItag: args.quality?.videoItag ?? args.current?.videoItag ?? args.config.videoItag,
    audioItag: args.quality?.audioItag ?? args.current?.audioItag ?? args.config.audioItag,
    audioTrackId:
      args.quality?.audioTrackId ?? args.current?.audioTrackId ?? args.config.audioTrackId,
    startTimeMs: args.startTimeMs,
    policy: args.deps.policy,
    signal: args.signal,
  });
}
