import { expect, test } from "bun:test";
import type { PlaybackManifest } from "../src/manifest";
import type { PlaybackWindow, PlaybackWindowRequest } from "../src/playback-window";
import { loadPlaybackSession } from "../src/session-loader";

if (typeof globalThis.MediaSource === "undefined") {
  Object.defineProperty(globalThis, "MediaSource", {
    value: { isTypeSupported: () => true },
    configurable: true,
  });
}

const manifest: PlaybackManifest = {
  durationMs: 120_000,
  audio: {
    kind: "audio",
    mime: 'audio/mp4; codecs="mp4a.40.2"',
    initUrl: "/audio/init",
    segments: [],
  },
  video: {
    kind: "video",
    mime: 'video/webm; codecs="vp9"',
    initUrl: "/video/init",
    segments: [],
  },
};

function window(request: PlaybackWindowRequest, ready: boolean): PlaybackWindow {
  return {
    sessionId: "vp9-session",
    generation: request.generation,
    ready,
    retryAfterMs: null,
    terminalError: null,
    recoveryAction: null,
    retryVideoItags: [],
    manifest: ready ? manifest : null,
  };
}

test("keeps buffered ranges bound to their loaded itags during a codec switch", async () => {
  const requests: PlaybackWindowRequest[] = [];
  const playback = {
    position: async (_sessionId: string, request: PlaybackWindowRequest) => {
      requests.push(request);
      return window(request, false);
    },
    prefetch: async (_sessionId: string, request: PlaybackWindowRequest) => window(request, false),
    segments: async (_sessionId: string, request: PlaybackWindowRequest) => window(request, true),
  };
  await loadPlaybackSession({
    playback,
    media: {
      attach: async () => undefined,
      bufferedRanges: () => [
        { kind: "audio", startMs: 0, endMs: 30_000 },
        { kind: "video", startMs: 0, endMs: 30_000 },
      ],
    },
    scheduler: { reset: () => undefined, appendInit: async () => undefined },
    video: { currentTime: 20 },
    response: {
      sessionId: "vp9-session",
      videoId: "dQw4w9WgXcQ",
      generation: 0,
      ready: false,
      retryAfterMs: null,
    },
    videoItag: 247,
    audioItag: 140,
    bufferedVideoItag: 136,
    bufferedAudioItag: 140,
    audioTrackId: null,
    startTimeMs: 20_000,
    policy: {
      bufferGoalMs: 30_000,
      backBufferMs: 30_000,
      pollIntervalMs: 500,
      manifestRefreshMs: 8_000,
      manifestPollLimit: 2,
      segmentPollLimit: 2,
    },
    signal: new AbortController().signal,
  });
  expect(requests[0]?.videoItag).toBe(247);
  expect(requests[0]?.bufferedRanges).toEqual([
    { itag: 140, startMs: 0, endMs: 30_000 },
    { itag: 136, startMs: 0, endMs: 30_000 },
  ]);
});
