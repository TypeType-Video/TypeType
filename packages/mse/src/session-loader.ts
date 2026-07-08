import type { BufferPolicy } from "./buffer-policy";
import type { PlaybackManifest } from "./manifest";
import { MediaSourceController } from "./media-source-controller";
import type { PlaybackClient, PlaybackResponse } from "./playback-client";
import type { PlaybackWindowRequest } from "./playback-window";
import type { SegmentScheduler } from "./segment-scheduler";

export type LoadedSession = {
  response: PlaybackResponse;
  manifest: PlaybackManifest;
  videoItag: number;
  audioItag: number;
  audioTrackId: string | null;
};

type LoadSessionArgs = {
  playback: PlaybackClient;
  media: MediaSourceController;
  scheduler: SegmentScheduler;
  video: HTMLVideoElement;
  response: PlaybackResponse;
  videoItag: number;
  audioItag: number;
  audioTrackId: string | null;
  startTimeMs: number;
  policy: BufferPolicy;
  signal: AbortSignal;
};

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
  if (args.startTimeMs > 0) args.video.currentTime = args.startTimeMs / 1000;
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
  session: LoadedSession,
  policy: BufferPolicy,
  playerTimeMs: number,
  signal: AbortSignal,
): Promise<void> {
  const request = playbackWindowRequest({ ...session, policy }, playerTimeMs);
  const window = await waitForWindow(
    { playback, policy, signal },
    session.response.sessionId,
    request,
  );
  if (!window.manifest) throw new Error("Playback window is not ready");
  session.response = { ...session.response, generation: window.generation };
  session.manifest = window.manifest;
}

function playbackWindowRequest(
  args: Pick<LoadSessionArgs, "response" | "videoItag" | "audioItag" | "audioTrackId" | "policy">,
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
  };
}

async function waitForWindow(
  args: Pick<LoadSessionArgs, "playback" | "policy" | "signal">,
  sessionId: string,
  request: PlaybackWindowRequest,
) {
  for (let attempt = 0; attempt < args.policy.manifestPollLimit; attempt += 1) {
    if (args.signal.aborted) throw new DOMException("Operation aborted", "AbortError");
    const window = await args.playback.window(sessionId, request, args.signal);
    if (window.terminalError) throw new Error(window.terminalError);
    if (window.ready && window.manifest) return window;
    await new Promise((resolve) => setTimeout(resolve, window.retryAfterMs ?? 500));
  }
  throw new Error("Playback window was not ready in time");
}
