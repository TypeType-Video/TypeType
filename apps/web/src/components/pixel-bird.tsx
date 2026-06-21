import type { CSSProperties } from "react";

const FRAMES = [0, 1, 2, 3];
const FLAP = 0.5;
const PIXEL: CSSProperties = { imageRendering: "pixelated" };

type Props = {
  className?: string;
};

export function PixelBird({ className }: Props) {
  return (
    <div className={className}>
      {FRAMES.map((i) => (
        <img
          key={i}
          alt=""
          aria-hidden="true"
          className={
            i === 0 ? "pixel-bird-flap block w-full" : "pixel-bird-flap absolute inset-0 w-full"
          }
          src={`/pixel/bird-${i}.png`}
          style={{
            ...PIXEL,
            opacity: i === 0 ? 1 : 0,
            animationDelay: `${(-((FRAMES.length - i) % FRAMES.length) * FLAP) / FRAMES.length}s`,
          }}
        />
      ))}
    </div>
  );
}
