import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { formatTimecode, parseTimecode } from "../lib/timecode";
import { toPublicWatchUrl } from "../lib/watch-url";

const MARGIN = 8;

type Props = {
  sourceUrl: string;
  anchorEl: HTMLElement | null;
  currentPositionMs: number;
  onClose: () => void;
  onShare: (url: string) => void;
};

export function ShareDropdown({ sourceUrl, anchorEl, currentPositionMs, onClose, onShare }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const anchorElRef = useRef(anchorEl);
  const onCloseRef = useRef(onClose);
  const currentSeconds = Math.max(0, Math.floor(currentPositionMs / 1000));
  const [timecode, setTimecode] = useState(() => formatTimecode(currentSeconds));
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({ visibility: "hidden" });
  anchorElRef.current = anchorEl;
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    if (!anchorEl || !panelRef.current) return;
    const anchor = anchorEl.getBoundingClientRect();
    const panel = panelRef.current.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const left = Math.max(MARGIN, Math.min(anchor.left, vw - panel.width - MARGIN));
    const top = Math.max(MARGIN, anchor.bottom + MARGIN);
    setPanelStyle({ position: "fixed", top, left, visibility: "visible" });
  }, [anchorEl]);

  useEffect(() => {
    function onMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      const outsidePanel = panelRef.current && !panelRef.current.contains(target);
      const outsideAnchor = !anchorElRef.current?.contains(target);
      if (outsidePanel && outsideAnchor) onCloseRef.current();
    }
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, []);

  function sharePlain() {
    onShare(toPublicWatchUrl(sourceUrl, window.location.origin));
    onClose();
  }

  function shareTimecode() {
    const seconds = parseTimecode(timecode);
    onShare(toPublicWatchUrl(sourceUrl, window.location.origin, seconds ?? currentSeconds));
    onClose();
  }

  return createPortal(
    <div
      ref={panelRef}
      style={panelStyle}
      className="fixed z-50 w-56 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl"
    >
      <button
        type="button"
        onClick={sharePlain}
        className="w-full px-3 py-2 text-left text-sm text-fg transition-colors hover:bg-surface-strong"
      >
        Copy link
      </button>
      <div className="border-t border-border px-3 py-2">
        <label className="mb-2 block text-xs text-fg-soft" htmlFor="share-timecode">
          Copy from time
        </label>
        <div className="flex gap-2">
          <input
            id="share-timecode"
            type="text"
            value={timecode}
            onChange={(event) => setTimecode(event.currentTarget.value)}
            className="min-w-0 flex-1 border-border-strong border-b bg-transparent px-0 py-1 text-sm text-fg outline-none focus:border-fg"
          />
          <button
            type="button"
            onClick={shareTimecode}
            className="text-xs font-semibold text-fg hover:text-white"
          >
            Copy
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
