import { useCallback, useEffect, useRef, useState } from "react";
import { recordClientEvent } from "../lib/client-debug-log";

export type YoutubeRemotePhase =
  | "idle"
  | "connecting"
  | "opening"
  | "awaiting_login"
  | "capturing_session"
  | "connected"
  | "closed"
  | "error";

export type YoutubeRemoteInput =
  | { type: "resize"; width: number; height: number }
  | { type: "pointer"; event: "down" | "up" | "move"; x: number; y: number; button: "left" }
  | { type: "wheel"; deltaX: number; deltaY: number }
  | { type: "key"; event: "down" | "up"; key: string; code: string; modifiers: string[] }
  | { type: "text"; value: string }
  | { type: "cancel" };

type RemoteStatus = {
  type: "status";
  phase: YoutubeRemotePhase;
};

type RemoteError = {
  type: "error";
  message: string;
};

function isYoutubeRemotePhase(value: string): value is YoutubeRemotePhase {
  return (
    value === "idle" ||
    value === "connecting" ||
    value === "opening" ||
    value === "awaiting_login" ||
    value === "capturing_session" ||
    value === "connected" ||
    value === "closed" ||
    value === "error"
  );
}

function parseRemoteMessage(value: string): RemoteStatus | RemoteError | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || !("type" in parsed)) return null;
  if (
    parsed.type === "status" &&
    "phase" in parsed &&
    typeof parsed.phase === "string" &&
    isYoutubeRemotePhase(parsed.phase)
  ) {
    return { type: "status", phase: parsed.phase };
  }
  if (parsed.type === "error" && "message" in parsed && typeof parsed.message === "string") {
    return { type: "error", message: parsed.message };
  }
  return null;
}

export function useYoutubeRemoteBrowser(wsUrl: string | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const frameRef = useRef<string | null>(null);
  const inputCountRef = useRef(0);
  const [phase, setPhase] = useState<YoutubeRemotePhase>(wsUrl ? "connecting" : "idle");
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!wsUrl) {
      setPhase("idle");
      setError(null);
      return;
    }

    let active = true;
    let finished = false;
    let frameCount = 0;
    setPhase("connecting");
    setError(null);
    const ws = new WebSocket(wsUrl);
    ws.binaryType = "blob";
    wsRef.current = ws;

    recordClientEvent("youtube_remote.ws_connecting", { hasUrl: true });

    ws.onopen = () => {
      recordClientEvent("youtube_remote.ws_open");
    };

    ws.onmessage = (event) => {
      if (typeof event.data === "string") {
        const message = parseRemoteMessage(event.data);
        if (message?.type === "status") {
          if (message.phase === "connected") finished = true;
          setPhase(message.phase);
          recordClientEvent("youtube_remote.status", { phase: message.phase });
        }
        if (message?.type === "error") {
          setPhase("error");
          setError(message.message);
          recordClientEvent("youtube_remote.backend_error", { message: message.message });
        }
        return;
      }
      const blob = event.data instanceof Blob ? event.data : new Blob([event.data]);
      const nextUrl = URL.createObjectURL(blob);
      if (frameRef.current) URL.revokeObjectURL(frameRef.current);
      frameRef.current = nextUrl;
      setFrameUrl(nextUrl);
      frameCount += 1;
      if (frameCount === 1 || frameCount % 50 === 0) {
        recordClientEvent("youtube_remote.frame", { count: frameCount, bytes: blob.size });
      }
    };

    ws.onerror = () => {
      finished = true;
      setPhase("error");
      setError("Remote browser connection failed");
      recordClientEvent("youtube_remote.ws_error");
    };

    ws.onclose = () => {
      recordClientEvent("youtube_remote.ws_close", { finished });
      if (active && !finished) setPhase("closed");
    };

    return () => {
      active = false;
      ws.close();
      wsRef.current = null;
      if (frameRef.current) URL.revokeObjectURL(frameRef.current);
      frameRef.current = null;
      setFrameUrl(null);
    };
  }, [wsUrl]);

  const send = useCallback((message: YoutubeRemoteInput) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      recordClientEvent("youtube_remote.input_dropped", { type: message.type });
      return false;
    }
    ws.send(JSON.stringify(message));
    inputCountRef.current += 1;
    if (
      message.type !== "pointer" ||
      message.event !== "move" ||
      inputCountRef.current % 25 === 0
    ) {
      recordClientEvent("youtube_remote.input_sent", {
        type: message.type,
        event: "event" in message ? message.event : null,
        length: message.type === "text" ? message.value.length : null,
      });
    }
    return true;
  }, []);

  return { phase, frameUrl, error, send };
}
