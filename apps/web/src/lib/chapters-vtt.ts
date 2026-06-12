import type { SponsorBlockSegmentItem, StreamSegmentItem } from "../types/api";
import {
  getSponsorBlockCategoryLabel,
  getSponsorBlockEndTime,
  getSponsorBlockStartTime,
} from "./sponsorblock-settings";

function formatVttTime(seconds: number): string {
  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  const millis = Math.round((seconds - totalSeconds) * 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

export function buildChaptersVtt(
  segments: StreamSegmentItem[],
  durationSeconds: number,
): string | null {
  if (segments.length === 0) return null;

  const sorted = [...segments].sort((a, b) => a.startTimeSeconds - b.startTimeSeconds);
  const lines: string[] = ["WEBVTT", ""];

  for (let i = 0; i < sorted.length; i++) {
    const seg = sorted[i];
    const next = sorted[i + 1];
    const start = seg.startTimeSeconds;
    const end = next ? next.startTimeSeconds : durationSeconds;
    lines.push(String(i + 1));
    lines.push(`${formatVttTime(start)} --> ${formatVttTime(end)}`);
    lines.push(seg.title);
    lines.push("");
  }

  const blob = new Blob([lines.join("\n")], { type: "text/vtt" });
  return URL.createObjectURL(blob);
}

export function buildSponsorBlockChaptersVtt(
  segments: SponsorBlockSegmentItem[],
  durationSeconds: number,
): string | null {
  if (segments.length === 0) return null;

  const sorted = [...segments].sort((a, b) => a.startTime - b.startTime);
  const lines: string[] = ["WEBVTT", ""];

  sorted.forEach((segment, index) => {
    lines.push(String(index + 1));
    lines.push(
      `${formatVttTime(getSponsorBlockStartTime(segment, durationSeconds))} --> ${formatVttTime(getSponsorBlockEndTime(segment, durationSeconds))}`,
    );
    lines.push(getSponsorBlockCategoryLabel(segment.category));
    lines.push("");
  });

  const blob = new Blob([lines.join("\n")], { type: "text/vtt" });
  return URL.createObjectURL(blob);
}
