import { Rabbit } from "lucide-react";

export function PlayerFastForwardIndicator() {
  return (
    <div className="pointer-events-none absolute bottom-18 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-3.5 py-2 text-sm font-semibold text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm sm:bottom-24 sm:px-4 sm:text-base">
      <Rabbit className="player-rabbit-hop h-5 w-5" aria-hidden="true" />
      <span>2x</span>
    </div>
  );
}
