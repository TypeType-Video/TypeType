import type { CSSProperties } from "react";

const PIXEL: CSSProperties = { imageRendering: "pixelated" };

type Props = {
  prefix: string;
  count: number;
  frameClass: string;
  cycle: number;
  className?: string;
};

export function PixelFlipbook({ prefix, count, frameClass, cycle, className }: Props) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => i).map((i) => (
        <img
          key={i}
          alt=""
          aria-hidden="true"
          className={
            i === 0 ? `${frameClass} block w-full` : `${frameClass} absolute inset-0 w-full`
          }
          src={`/pixel/${prefix}-${i}.png`}
          style={{
            ...PIXEL,
            opacity: i === 0 ? 1 : 0,
            animationDelay: `${(-((count - i) % count) * cycle) / count}s`,
          }}
        />
      ))}
    </div>
  );
}
