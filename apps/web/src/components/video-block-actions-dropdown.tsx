import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MARGIN = 8;

type Props = {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onToggleVideoBlock?: () => void;
  onToggleChannelBlock?: () => void;
  videoBlocked?: boolean;
  channelBlocked?: boolean;
};

export function VideoBlockActionsDropdown({
  anchorEl,
  onClose,
  onToggleVideoBlock,
  onToggleChannelBlock,
  videoBlocked,
  channelBlocked,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({ visibility: "hidden" });
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const anchorElRef = useRef(anchorEl);
  anchorElRef.current = anchorEl;

  useLayoutEffect(() => {
    if (!anchorEl || !panelRef.current) return;
    const anchor = anchorEl.getBoundingClientRect();
    const panel = panelRef.current.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;

    let left = anchor.right - panel.width;
    left = Math.min(left, vw - panel.width - MARGIN);
    left = Math.max(MARGIN, left);

    const spaceBelow = vh - anchor.bottom - MARGIN;
    const spaceAbove = anchor.top - MARGIN;
    let top =
      spaceBelow >= panel.height || spaceBelow >= spaceAbove
        ? anchor.bottom + MARGIN
        : anchor.top - panel.height - MARGIN;
    top = Math.max(MARGIN, Math.min(top, vh - panel.height - MARGIN));

    setPanelStyle({ position: "fixed", top, left, visibility: "visible" });
  }, [anchorEl]);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      const outsidePanel = panelRef.current && !panelRef.current.contains(target);
      const outsideAnchor = !anchorElRef.current?.contains(target);
      if (outsidePanel && outsideAnchor) onCloseRef.current();
    }
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, []);

  return createPortal(
    <div
      ref={panelRef}
      style={panelStyle}
      className="fixed z-50 w-56 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-2xl"
    >
      {onToggleVideoBlock && (
        <button
          type="button"
          onClick={() => {
            onToggleVideoBlock();
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-sm text-fg transition-colors hover:bg-surface-strong"
        >
          {videoBlocked ? "Unblock video" : "Block video"}
        </button>
      )}
      {onToggleChannelBlock && (
        <button
          type="button"
          onClick={() => {
            onToggleChannelBlock();
            onClose();
          }}
          className="w-full px-3 py-2 text-left text-sm text-fg transition-colors hover:bg-surface-strong"
        >
          {channelBlocked ? "Unblock channel" : "Block channel"}
        </button>
      )}
    </div>,
    document.body,
  );
}
