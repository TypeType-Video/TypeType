import { PixelTable } from "./pixel-table";
import { PixelTv } from "./pixel-tv";

export function PixelTvStand() {
  return (
    <div className="absolute bottom-[22%] left-[72%] w-[33vw] -translate-x-1/2 sm:left-[71%] sm:w-[min(11rem,18vw)]">
      <PixelTv className="pixel-tv-drop absolute bottom-[69%] left-1/2 w-[52%] -translate-x-1/2 drop-shadow-[2px_3px_0_rgba(0,0,0,0.2)]" />
      <PixelTable className="pixel-table-drop block w-full" />
    </div>
  );
}
