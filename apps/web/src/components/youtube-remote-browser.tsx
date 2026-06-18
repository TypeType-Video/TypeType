import type { KeyboardEvent, PointerEvent } from "react";
import { useEffect, useRef, useState } from "react";
import type { YoutubeRemoteInput, YoutubeRemotePhase } from "../hooks/use-youtube-remote-browser";

type Props = {
  frameUrl: string | null;
  phase: YoutubeRemotePhase;
  error: string | null;
  onInput: (message: YoutubeRemoteInput) => void;
};

type FrameSize = {
  width: number;
  height: number;
};

function modifiers(event: KeyboardEvent): string[] {
  const next: string[] = [];
  if (event.altKey) next.push("Alt");
  if (event.ctrlKey) next.push("Control");
  if (event.metaKey) next.push("Meta");
  if (event.shiftKey) next.push("Shift");
  return next;
}

function isTextKey(event: KeyboardEvent): boolean {
  return event.key.length === 1 && !event.altKey && !event.ctrlKey && !event.metaKey;
}

function isPasteShortcut(event: KeyboardEvent): boolean {
  return event.key.toLowerCase() === "v" && (event.ctrlKey || event.metaKey) && !event.altKey;
}

export function YoutubeRemoteBrowser({ frameUrl, phase, error, onInput }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [frameSize, setFrameSize] = useState<FrameSize | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      if (width > 0 && height > 0) onInput({ type: "resize", width, height });
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, [onInput]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      onInput({ type: "wheel", deltaX: event.deltaX, deltaY: event.deltaY });
    };
    input.addEventListener("wheel", handleWheel, { passive: false });
    return () => input.removeEventListener("wheel", handleWheel);
  }, [onInput]);

  function point(event: PointerEvent) {
    const rect =
      rootRef.current?.getBoundingClientRect() ?? event.currentTarget.getBoundingClientRect();
    const rawX = event.clientX - rect.left;
    const rawY = event.clientY - rect.top;
    if (!frameSize) {
      return { x: Math.round(rawX), y: Math.round(rawY) };
    }
    const scale = Math.min(rect.width / frameSize.width, rect.height / frameSize.height);
    if (!Number.isFinite(scale) || scale <= 0) {
      return { x: Math.round(rawX), y: Math.round(rawY) };
    }
    const offsetX = (rect.width - frameSize.width * scale) / 2;
    const offsetY = (rect.height - frameSize.height * scale) / 2;
    const x = Math.round((rawX - offsetX) / scale);
    const y = Math.round((rawY - offsetY) / scale);
    return {
      x: Math.max(0, Math.min(frameSize.width - 1, x)),
      y: Math.max(0, Math.min(frameSize.height - 1, y)),
    };
  }

  return (
    <div
      ref={rootRef}
      className="relative aspect-video min-h-[22rem] w-full overflow-hidden border border-border bg-black focus-within:border-fg sm:min-h-[30rem]"
    >
      {frameUrl ? (
        <img
          src={frameUrl}
          alt=""
          className="h-full w-full object-contain"
          onLoad={(event) => {
            setFrameSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            });
          }}
        />
      ) : null}
      {!frameUrl && (
        <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
          <span className="text-fg text-sm">Remote browser {phase.replace(/_/g, " ")}</span>
          <span className="text-fg-soft text-xs">The YouTube sign-in window will appear here.</span>
          {error && <span className="text-danger-strong text-xs">{error}</span>}
        </span>
      )}
      <textarea
        ref={inputRef}
        aria-label="YouTube sign-in remote browser"
        value=""
        onChange={() => undefined}
        className="absolute inset-0 h-full w-full touch-none resize-none cursor-default border-0 bg-transparent p-0 text-base text-transparent caret-transparent outline-none"
        onPointerDown={(event) => {
          event.currentTarget.focus();
          event.currentTarget.setPointerCapture(event.pointerId);
          onInput({ type: "pointer", event: "down", ...point(event), button: "left" });
        }}
        onPointerMove={(event) =>
          onInput({ type: "pointer", event: "move", ...point(event), button: "left" })
        }
        onPointerUp={(event) =>
          onInput({ type: "pointer", event: "up", ...point(event), button: "left" })
        }
        onKeyDown={(event) => {
          if (isPasteShortcut(event)) return;
          event.preventDefault();
          if (isTextKey(event)) {
            onInput({ type: "text", value: event.key });
            return;
          }
          onInput({
            type: "key",
            event: "down",
            key: event.key,
            code: event.code,
            modifiers: modifiers(event),
          });
        }}
        onKeyUp={(event) => {
          if (isPasteShortcut(event)) return;
          event.preventDefault();
          if (!isTextKey(event)) {
            onInput({
              type: "key",
              event: "up",
              key: event.key,
              code: event.code,
              modifiers: modifiers(event),
            });
          }
        }}
        onPaste={(event) => {
          event.preventDefault();
          const value = event.clipboardData.getData("text");
          if (value) onInput({ type: "text", value });
        }}
      />
    </div>
  );
}
