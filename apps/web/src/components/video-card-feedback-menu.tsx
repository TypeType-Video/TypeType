import { lazy, Suspense, useRef, useState } from "react";
import type { VideoStream } from "../types/stream";
import { MoreIcon } from "./watch-icons";

const VideoCardFeedbackPanel = lazy(() =>
  import("./video-card-feedback-panel").then((module) => ({
    default: module.VideoCardFeedbackPanel,
  })),
);

type Props = {
  stream: VideoStream;
};

export function VideoCardFeedbackMenu({ stream }: Props) {
  const menuRef = useRef<HTMLButtonElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <button
        ref={menuRef}
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="rounded-md p-1 text-fg-muted transition-colors hover:bg-surface-strong hover:text-fg"
        aria-label="Video options"
      >
        <MoreIcon />
      </button>
      {menuOpen && (
        <Suspense fallback={null}>
          <VideoCardFeedbackPanel
            stream={stream}
            anchorEl={menuRef.current}
            onClose={() => setMenuOpen(false)}
          />
        </Suspense>
      )}
    </>
  );
}
