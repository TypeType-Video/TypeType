import { ChevronDown } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PLAYLIST_SORT_OPTIONS, type PlaylistSortMode } from "../lib/playlist-sort";

const MARGIN = 8;

type Props = {
  value: PlaylistSortMode;
  onChange: (value: PlaylistSortMode) => void;
};

export function PlaylistSortMenu({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({ visibility: "hidden" });
  const current = PLAYLIST_SORT_OPTIONS.find((option) => option.value === value);

  useLayoutEffect(() => {
    if (!open || !anchorRef.current || !panelRef.current) return;
    const anchor = anchorRef.current.getBoundingClientRect();
    const panel = panelRef.current.getBoundingClientRect();
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    let left = Math.min(anchor.right - panel.width, vw - panel.width - MARGIN);
    left = Math.max(MARGIN, left);
    const spaceBelow = vh - anchor.bottom - MARGIN;
    let top =
      spaceBelow >= panel.height ? anchor.bottom + MARGIN : anchor.top - panel.height - MARGIN;
    top = Math.max(MARGIN, Math.min(top, vh - panel.height - MARGIN));
    setPanelStyle({ position: "fixed", top, left, visibility: "visible" });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchorRef.current?.contains(target)) return;
      setOpen(false);
    }
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-surface-strong"
      >
        <span className="text-fg-muted">Sort</span>
        <span>{current?.label ?? "Manual"}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-fg-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={panelStyle}
            className="fixed z-50 w-56 overflow-hidden rounded-lg border border-border-strong bg-surface py-1 shadow-2xl"
          >
            {PLAYLIST_SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-surface-strong ${
                  option.value === value ? "text-fg" : "text-fg-muted"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
}
