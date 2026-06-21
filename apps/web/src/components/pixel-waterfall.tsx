import type { CSSProperties } from "react";

const FRAMES = [0, 1, 2, 3];
const CYCLE = 0.46;
const DROP_END = 2.5;
const PIXEL: CSSProperties = { imageRendering: "pixelated" };

type Props = {
  className?: string;
};

export function PixelWaterfall({ className }: Props) {
  return (
    <div className={className}>
      {FRAMES.map((i) => (
        <img
          key={i}
          alt=""
          aria-hidden="true"
          className="pixel-waterfall-frame absolute inset-0 h-full w-full"
          src={`/pixel/waterfall-${i}.png`}
          style={{
            ...PIXEL,
            opacity: i === 0 ? 1 : 0,
            animationDelay: `${DROP_END + (i * CYCLE) / FRAMES.length}s`,
          }}
        />
      ))}
    </div>
  );
}
