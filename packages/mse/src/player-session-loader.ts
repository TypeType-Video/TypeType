import type { PlayerDeps } from "./player-deps";
import {
  type LoadedSession,
  loadPlaybackSession,
  PlaybackWindowRecoveryError,
} from "./session-loader";
import type { TypeTypeMseConfig, TypeTypeMseQuality } from "./types";

type Args = {
  deps: PlayerSessionDeps;
  config: TypeTypeMseConfig;
  video: { currentTime: number };
  response: LoadedSession["response"];
  current: LoadedSession | null;
  quality: TypeTypeMseQuality | undefined;
  startTimeMs: number;
  signal: AbortSignal;
};

type PlayerSessionDeps = {
  playback: Pick<PlayerDeps["playback"], "create" | "position" | "prefetch" | "segments">;
  media: Pick<PlayerDeps["media"], "attach" | "bufferedRanges">;
  scheduler: Pick<PlayerDeps["scheduler"], "appendInit" | "reset">;
  policy: PlayerDeps["policy"];
};

type TrackSelection = {
  videoItag: number;
  audioItag: number;
  audioTrackId: string | null;
};

export async function loadPlayerSession(args: Args): Promise<LoadedSession> {
  const selection = resolveSelection(args);
  try {
    return await loadSelectedSession(args, args.response, selection);
  } catch (error) {
    if (!(error instanceof PlaybackWindowRecoveryError)) throw error;
    return recoverWithFreshSessions(args, selection, error.retryVideoItags);
  }
}

function resolveSelection(args: Args): TrackSelection {
  return {
    videoItag: args.quality?.videoItag ?? args.current?.videoItag ?? args.config.videoItag,
    audioItag: args.quality?.audioItag ?? args.current?.audioItag ?? args.config.audioItag,
    audioTrackId:
      args.quality?.audioTrackId ?? args.current?.audioTrackId ?? args.config.audioTrackId,
  };
}

function loadSelectedSession(
  args: Args,
  response: LoadedSession["response"],
  selection: TrackSelection,
): Promise<LoadedSession> {
  return loadPlaybackSession({
    playback: args.deps.playback,
    media: args.deps.media,
    scheduler: args.deps.scheduler,
    video: args.video,
    response,
    videoItag: selection.videoItag,
    audioItag: selection.audioItag,
    audioTrackId: selection.audioTrackId,
    startTimeMs: args.startTimeMs,
    policy: args.deps.policy,
    signal: args.signal,
  });
}

async function recoverWithFreshSessions(
  args: Args,
  selection: TrackSelection,
  retryVideoItags: number[],
): Promise<LoadedSession> {
  let lastError: unknown = null;
  for (const videoItag of retryVideoItags) {
    if (videoItag === selection.videoItag) continue;
    try {
      const response = await args.deps.playback.create(
        {
          videoId: args.config.videoId,
          videoItag,
          audioItag: selection.audioItag,
          audioTrackId: selection.audioTrackId,
          startTimeMs: args.startTimeMs,
        },
        args.signal,
      );
      return await loadSelectedSession(args, response, { ...selection, videoItag });
    } catch (error) {
      if (isAbortError(error)) throw error;
      lastError = error;
    }
  }
  if (lastError instanceof Error) throw lastError;
  throw new Error("Playback window recovery failed");
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}
