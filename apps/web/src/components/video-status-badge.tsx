import type { VideoStream } from "../types/stream";

type Props = {
  stream: VideoStream;
  compact?: boolean;
};

export function VideoStatusBadge({ stream, compact = false }: Props) {
  const label = stream.isLive ? "LIVE" : stream.isPostLive ? "REPLAY" : null;
  if (!label) return null;
  return (
    <span
      className={`rounded px-1.5 py-0.5 font-semibold text-white ${
        stream.isLive ? "bg-red-600" : "bg-black/80"
      } ${compact ? "text-[10px]" : "text-xs"}`}
    >
      {label}
    </span>
  );
}
