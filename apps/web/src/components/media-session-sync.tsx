import { useEffect, useRef } from "react";
import { useMediaRemote, useMediaState } from "../lib/vidstack";
import { MediaSessionPositionSync } from "./media-session-position-sync";

type Props = {
  title?: string;
  artist?: string;
  artwork?: string;
  canSeek?: boolean;
  isLive?: boolean;
  onPreviousTrack?: () => void;
  onNextTrack?: () => void;
};

function safeSetActionHandler(
  session: MediaSession,
  action: MediaSessionAction,
  handler: MediaSessionActionHandler | null,
) {
  try {
    session.setActionHandler(action, handler);
  } catch {}
}

export function MediaSessionSync({
  title,
  artist,
  artwork,
  canSeek = true,
  isLive = false,
  onPreviousTrack,
  onNextTrack,
}: Props) {
  const remote = useMediaRemote();
  const paused = useMediaState("paused");
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (typeof MediaMetadata === "undefined") return;
    const safeTitle = title?.trim();
    if (!safeTitle) return;
    const safeArtist = artist?.trim();
    const safeArtwork = artwork?.trim();
    navigator.mediaSession.metadata = new MediaMetadata({
      title: safeTitle,
      artist: safeArtist,
      artwork: safeArtwork
        ? [{ src: safeArtwork, sizes: "512x512", type: "image/png" }]
        : undefined,
    });
  }, [title, artist, artwork]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    safeSetActionHandler(session, "play", () => {
      void Promise.resolve(remote.play()).catch(() => {});
    });
    safeSetActionHandler(session, "pause", () => {
      void Promise.resolve(remote.pause()).catch(() => {});
    });
    if (canSeek) {
      safeSetActionHandler(session, "seekbackward", (details) => {
        const step = details.seekOffset ?? 10;
        const target = Math.max(0, currentTimeRef.current - step);
        remote.seek(target);
      });
      safeSetActionHandler(session, "seekforward", (details) => {
        const step = details.seekOffset ?? 10;
        const max = durationRef.current > 0 ? durationRef.current : Number.POSITIVE_INFINITY;
        const target = Math.min(max, currentTimeRef.current + step);
        remote.seek(target);
      });
      safeSetActionHandler(session, "seekto", (details) => {
        const next = details.seekTime;
        if (typeof next !== "number" || Number.isNaN(next)) return;
        remote.seek(next);
      });
    }
    safeSetActionHandler(session, "stop", () => {
      void Promise.resolve(remote.pause()).catch(() => {});
    });
    safeSetActionHandler(session, "previoustrack", isLive ? null : (onPreviousTrack ?? null));
    safeSetActionHandler(session, "nexttrack", isLive ? null : (onNextTrack ?? null));
    return () => {
      safeSetActionHandler(session, "play", null);
      safeSetActionHandler(session, "pause", null);
      safeSetActionHandler(session, "seekbackward", null);
      safeSetActionHandler(session, "seekforward", null);
      safeSetActionHandler(session, "seekto", null);
      safeSetActionHandler(session, "stop", null);
      safeSetActionHandler(session, "previoustrack", null);
      safeSetActionHandler(session, "nexttrack", null);
    };
  }, [canSeek, isLive, onPreviousTrack, onNextTrack, remote]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = paused ? "paused" : "playing";
  }, [paused]);

  return <MediaSessionPositionSync currentTimeRef={currentTimeRef} durationRef={durationRef} />;
}
