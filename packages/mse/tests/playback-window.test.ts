import { expect, test } from "bun:test";
import { parsePlaybackWindow } from "../src/playback-window";

test("parses native playback windows", () => {
  const window = parsePlaybackWindow(
    {
      sessionId: "session",
      generation: 2,
      ready: true,
      retryAfterMs: null,
      terminalError: null,
      durationMs: 120_000,
      audio: {
        mime: 'audio/mp4; codecs="mp4a.40.2"',
        initUrl: "/api/sabr/playback/session/140/init?generation=2",
        segments: [
          { url: "/api/sabr/playback/session/140/segment/13", startMs: 120_000, durationMs: 5_000 },
        ],
      },
      video: {
        mime: 'video/mp4; codecs="avc1.640028"',
        initUrl: "/api/sabr/playback/session/137/init?generation=2",
        segments: [
          { url: "/api/sabr/playback/session/137/segment/24", startMs: 119_604, durationMs: 5_000 },
        ],
      },
    },
    "https://beta.typetype.video/api/sabr/playback/session/window",
  );
  expect(window.generation).toBe(2);
  expect(window.terminalError).toBeNull();
  expect(window.manifest?.video.segments[0]?.url).toBe(
    "https://beta.typetype.video/api/sabr/playback/session/137/segment/24",
  );
});

test("parses playback window recovery hints", () => {
  const window = parsePlaybackWindow(
    {
      sessionId: "session",
      generation: 1,
      ready: false,
      retryAfterMs: 500,
      terminalError: "video:137:12 status=3 protected no-media",
      recoveryAction: "retry_fresh_session_lower_video_itag",
      retryVideoItags: [136, 135, 134],
    },
    "https://beta.typetype.video/api/sabr/playback/session/window",
  );
  expect(window.manifest).toBeNull();
  expect(window.recoveryAction).toBe("retry_fresh_session_lower_video_itag");
  expect(window.retryVideoItags).toEqual([136, 135, 134]);
});
