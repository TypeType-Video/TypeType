import { expect, test } from "bun:test";
import type { PlaybackManifest } from "../src/manifest";
import type { PlaybackResponse } from "../src/playback-client";
import type { PlaybackWindow, PlaybackWindowRequest } from "../src/playback-window";
import { loadPlayerSession } from "../src/player-session-loader";

Object.defineProperty(globalThis, "MediaSource", {
  value: {
    isTypeSupported(mime: string): boolean {
      return mime.length > 0;
    },
  },
});

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
    mime: 'video/mp4; codecs="avc1.640028"',
    initUrl: "/video/init",
    segments: [],
  },
};

function response(sessionId: string, videoId = "V_YKnVyUJgQ"): PlaybackResponse {
  return { sessionId, videoId, generation: 1, ready: false, retryAfterMs: null };
}

test("recovers terminal seek windows with a fresh lower video itag session", async () => {
  const createVideoItags: number[] = [];
  const attached: PlaybackManifest[] = [];
  const prefetchRequests: PlaybackWindowRequest[] = [];
  const segmentRequests: PlaybackWindowRequest[] = [];
  const positionRequests: PlaybackWindowRequest["bufferedRanges"][] = [];
  const video = { currentTime: 0 };
  const session = await loadPlayerSession({
    deps: {
      playback: {
        create: async (request) => {
          createVideoItags.push(request.videoItag);
          if (request.videoItag === 248) throw new Error("No SABR video for this video");
          return response(`fresh-${request.videoItag}`, request.videoId);
        },
        position: async (_sessionId, request): Promise<PlaybackWindow> => {
          positionRequests.push(request.bufferedRanges);
          return {
            sessionId: _sessionId,
            generation: request.generation,
            ready: false,
            retryAfterMs: null,
            terminalError: null,
            recoveryAction: null,
            retryVideoItags: [],
            manifest: null,
          };
        },
        prefetch: async (sessionId, request): Promise<PlaybackWindow> => {
          prefetchRequests.push(request);
          if (sessionId === "seek-session") {
            return {
              sessionId,
              generation: 1,
              ready: false,
              retryAfterMs: null,
              terminalError: "video:137:12 status=3 protected no-media",
              recoveryAction: "retry_fresh_session_lower_video_itag",
              retryVideoItags: [248, 136, 135],
              manifest: null,
            };
          }
          return {
            sessionId,
            generation: 2,
            ready: true,
            retryAfterMs: null,
            terminalError: null,
            recoveryAction: null,
            retryVideoItags: [],
            manifest,
          };
        },
        segments: async (sessionId, request): Promise<PlaybackWindow> => {
          segmentRequests.push(request);
          if (sessionId === "seek-session") {
            return {
              sessionId,
              generation: 1,
              ready: false,
              retryAfterMs: null,
              terminalError: "video:137:12 status=3 protected no-media",
              recoveryAction: "retry_fresh_session_lower_video_itag",
              retryVideoItags: [248, 136, 135],
              manifest: null,
            };
          }
          return {
            sessionId,
            generation: 2,
            ready: true,
            retryAfterMs: null,
            terminalError: null,
            recoveryAction: null,
            retryVideoItags: [],
            manifest,
          };
        },
      },
      media: {
        attach: async (nextManifest) => attached.push(nextManifest),
        bufferedRanges: () => [{ kind: "video", startMs: 0, endMs: 10_000 }],
      },
      scheduler: { reset: () => undefined, appendInit: async () => undefined },
      policy: {
        bufferGoalMs: 30_000,
        backBufferMs: 30_000,
        pollIntervalMs: 500,
        manifestRefreshMs: 8_000,
        manifestPollLimit: 2,
        segmentPollLimit: 2,
      },
    },
    config: {
      endpoint: "https://beta.typetype.video/api",
      videoId: "V_YKnVyUJgQ",
      videoItag: 137,
      audioItag: 140,
      audioTrackId: null,
    },
    video,
    response: response("seek-session"),
    current: null,
    quality: undefined,
    startTimeMs: 60_000,
    signal: new AbortController().signal,
  });

  expect(session.response.sessionId).toBe("fresh-136");
  expect(session.videoItag).toBe(136);
  expect(video.currentTime).toBe(0);
  expect(createVideoItags).toEqual([248, 136]);
  expect(attached).toHaveLength(1);
  expect(prefetchRequests.map((request) => request.playerTimeMs)).toEqual([60_000, 60_000]);
  expect(prefetchRequests.map((request) => request.videoItag)).toEqual([137, 136]);
  expect(segmentRequests.map((request) => request.videoItag)).toEqual([136]);
  expect(positionRequests[0]).toEqual([]);
});
