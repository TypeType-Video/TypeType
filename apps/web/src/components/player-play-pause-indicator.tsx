import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useMediaState } from "../lib/vidstack";

export function PlayerPlayPauseIndicator() {
  const paused = useMediaState("paused");
  const canPlay = useMediaState("canPlay");
  const [pulse, setPulse] = useState(0);
  const prevPausedRef = useRef(paused);
  const readyRef = useRef(false);

  useEffect(() => {
    if (!canPlay) return;
    if (!readyRef.current) {
      readyRef.current = true;
      prevPausedRef.current = paused;
      return;
    }
    if (paused === prevPausedRef.current) return;
    prevPausedRef.current = paused;
    setPulse((n) => n + 1);
  }, [paused, canPlay]);

  useEffect(() => {
    if (pulse === 0) return;
    const timer = window.setTimeout(() => setPulse(0), 500);
    return () => window.clearTimeout(timer);
  }, [pulse]);

  if (pulse === 0) return null;
  const Icon = paused ? Pause : Play;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <div
        key={pulse}
        className="player-pp-pop flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/20 backdrop-blur-sm"
      >
        <Icon className="h-7 w-7" aria-hidden="true" />
      </div>
    </div>
  );
}
