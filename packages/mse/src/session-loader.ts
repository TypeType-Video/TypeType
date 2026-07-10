import type { BufferPolicy } from "./buffer-policy";
import type { PlaybackManifest } from "./manifest";
import { type MediaBufferedRange, MediaSourceController } from "./media-source-controller";
import type { PlaybackClient, PlaybackResponse } from "./playback-client";
import type { PlaybackWindowRecoveryAction, PlaybackWindowRequest } from "./playback-window";
import type { SegmentScheduler } from "./segment-scheduler";

export type LoadedSession = {
  response: PlaybackResponse;
  manifest: PlaybackManifest;
  videoItag: number;
  audioItag: number;
  audioTrackId: string | null;
};

type LoadSessionArgs = {
  playback: Pick<PlaybackClient, "position" | "prefetch" | "segments">;
  media: Pick<MediaSourceController, "attach" | "bufferedRanges">;
  scheduler: Pick<SegmentScheduler, "appendInit" | "reset">;
  video: { currentTime: number };
  response: PlaybackResponse;
  videoItag: number;
  audioItag: number;
  bufferedVideoItag?: number;
  bufferedAudioItag?: number;
  audioTrackId: string | null;
  startTimeMs: number;
  policy: BufferPolicy;
  signal: AbortSignal;
};

type PlaybackWindowRequestArgs = Pick<
  LoadSessionArgs,
  | "response"
  | "videoItag"
  | "audioItag"
  | "bufferedVideoItag"
  | "bufferedAudioItag"
  | "audioTrackId"
  | "policy"
> & {
  media: Pick<MediaSourceController, "bufferedRanges">;
};

class PlaybackWindowTerminalError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlaybackWindowTerminalError";
  }
}

export class PlaybackWindowRecoveryError extends PlaybackWindowTerminalError {
  constructor(
    message: string,
    readonly recoveryAction: PlaybackWindowRecoveryAction,
    readonly retryVideoItags: number[],
  ) {
    super(message);
    this.name = "PlaybackWindowRecoveryError";
  }
}

class PlaybackWindowTimeoutError extends Error {
  constructor() {
    super("Playback window was not ready in time");
    this.name = "PlaybackWindowTimeoutError";
  }
}

export async function loadPlaybackSession(args: LoadSessionArgs): Promise<LoadedSession> {
  const request = playbackWindowRequest(args, args.startTimeMs);
  const window = await waitForWindow(args, args.response.sessionId, request);
  if (!window.manifest) throw new Error("Playback window is not ready");
  return attachSession(args, { ...args.response, generation: window.generation }, window.manifest);
}

async function attachSession(
  args: LoadSessionArgs,
  response: PlaybackResponse,
  manifest: PlaybackManifest,
): Promise<LoadedSession> {
  if (!MediaSourceController.supported(manifest)) throw new Error("MSE codecs are not supported");
  args.scheduler.reset();
  await args.media.attach(manifest);
  await args.scheduler.appendInit(manifest, args.signal);
  return {
    response,
    manifest,
    videoItag: args.videoItag,
    audioItag: args.audioItag,
    audioTrackId: args.audioTrackId,
  };
}

export async function refreshPlaybackWindow(
  playback: PlaybackClient,
  media: Pick<MediaSourceController, "bufferedRanges">,
  session: LoadedSession,
  policy: BufferPolicy,
  playerTimeMs: number,
  signal: AbortSignal,
): Promise<void> {
  const request = playbackWindowRequest({ ...session, media, policy }, playerTimeMs);
  const window = await pollSegments(
    { playback, policy, signal },
    session.response.sessionId,
    request,
  );
  if (!window?.manifest) return;
  session.response = { ...session.response, generation: window.generation };
  session.manifest = window.manifest;
}

function playbackWindowRequest(
  args: PlaybackWindowRequestArgs,
  playerTimeMs: number,
): PlaybackWindowRequest {
  return {
    generation: args.response.generation,
    playerTimeMs,
    videoItag: args.videoItag,
    audioItag: args.audioItag,
    audioTrackId: args.audioTrackId,
    bufferGoalMs: args.policy.bufferGoalMs,
    backBufferMs: args.policy.backBufferMs,
    bufferedRanges: playbackBufferedRanges(args.media.bufferedRanges(), args),
  };
}

function playbackBufferedRanges(
  ranges: MediaBufferedRange[],
  args: Pick<
    LoadSessionArgs,
    "videoItag" | "audioItag" | "bufferedVideoItag" | "bufferedAudioItag"
  >,
): PlaybackWindowRequest["bufferedRanges"] {
  return ranges.map((range) => ({
    itag:
      range.kind === "audio"
        ? (args.bufferedAudioItag ?? args.audioItag)
        : (args.bufferedVideoItag ?? args.videoItag),
    startMs: range.startMs,
    endMs: range.endMs,
  }));
}

async function waitForWindow(
  args: Pick<LoadSessionArgs, "playback" | "policy" | "signal">,
  sessionId: string,
  request: PlaybackWindowRequest,
) {
  const window = await pollSegments(args, sessionId, request);
  if (window) return window;
  throw new PlaybackWindowTimeoutError();
}

async function pollSegments(
  args: Pick<LoadSessionArgs, "playback" | "policy" | "signal">,
  sessionId: string,
  request: PlaybackWindowRequest,
) {
  for (let attempt = 0; attempt < args.policy.manifestPollLimit; attempt += 1) {
    if (args.signal.aborted) throw new DOMException("Operation aborted", "AbortError");
    handleWindow(await args.playback.position(sessionId, request, args.signal));
    handleWindow(await args.playback.prefetch(sessionId, request, args.signal));
    const window = handleWindow(await args.playback.segments(sessionId, request, args.signal));
    if (window.ready && window.manifest) return window;
    await new Promise((resolve) => setTimeout(resolve, window.retryAfterMs ?? 500));
  }
  return null;
}

function handleWindow(window: Awaited<ReturnType<PlaybackClient["segments"]>>) {
  if (!window.terminalError) return window;
  if (window.recoveryAction && window.retryVideoItags.length > 0) {
    throw new PlaybackWindowRecoveryError(
      window.terminalError,
      window.recoveryAction,
      window.retryVideoItags,
    );
  }
  throw new PlaybackWindowTerminalError(window.terminalError);
}
