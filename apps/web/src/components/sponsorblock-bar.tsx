import { useEffect, useRef } from "react";
import {
  getSponsorBlockCategoryColor,
  getSponsorBlockEndTime,
  getSponsorBlockStartTime,
} from "../lib/sponsorblock-settings";
import { useMediaState } from "../lib/vidstack";
import type { SponsorBlockSegmentItem } from "../types/api";

const TRACK_HEIGHT = 3;
const THUMB_MARGIN = 7.5;

type SegmentBarProps = {
  segment: SponsorBlockSegmentItem;
  duration: number;
};

function SegmentBar({ segment, duration }: SegmentBarProps) {
  const color = getSponsorBlockCategoryColor(segment.category);
  if (!color) return null;
  const startTime = getSponsorBlockStartTime(segment, duration);
  const endTime = getSponsorBlockEndTime(segment, duration);
  const left = (startTime / duration) * 100;
  const width = ((endTime - startTime) / duration) * 100;
  return (
    <div
      className="typetype-sponsorblock-segment"
      style={{
        position: "absolute",
        left: `${left}%`,
        width: `${width}%`,
        top: 0,
        bottom: 0,
        backgroundColor: color,
        opacity: 0.8,
        pointerEvents: "none",
      }}
    />
  );
}

type Props = { segments: SponsorBlockSegmentItem[] };

export function SponsorBlockBar({ segments }: Props) {
  const duration = useMediaState("duration");
  const controlsVisible = useMediaState("controlsVisible");
  const anchorRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anchor = anchorRef.current;
    const overlay = overlayRef.current;
    if (!anchor || !overlay || !duration) return;

    const player = anchor.closest<HTMLElement>("[data-media-player]");
    const slider = player?.querySelector<HTMLElement>(".vds-time-slider");
    if (!player || !slider) return;

    const update = () => {
      const pRect = player.getBoundingClientRect();
      const sRect = slider.getBoundingClientRect();
      const trackCenterY = sRect.top - pRect.top + sRect.height / 2;
      overlay.style.top = `${trackCenterY - TRACK_HEIGHT / 2}px`;
      overlay.style.left = `${sRect.left - pRect.left + THUMB_MARGIN}px`;
      overlay.style.width = `${sRect.width - THUMB_MARGIN * 2}px`;
    };

    const ro = new ResizeObserver(update);
    ro.observe(player);
    update();
    return () => ro.disconnect();
  }, [duration]);

  if (!duration || segments.length === 0) return null;

  return (
    <>
      <div ref={anchorRef} style={{ display: "none" }} />
      <div
        className="typetype-sponsorblock-bar"
        ref={overlayRef}
        style={{
          position: "absolute",
          height: `${TRACK_HEIGHT}px`,
          pointerEvents: "none",
          zIndex: 40,
          visibility: controlsVisible ? "visible" : "hidden",
        }}
      >
        {segments.map((seg) => (
          <SegmentBar key={`${seg.category}-${seg.startTime}`} segment={seg} duration={duration} />
        ))}
      </div>
    </>
  );
}
