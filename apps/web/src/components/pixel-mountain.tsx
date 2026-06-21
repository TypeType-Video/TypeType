type Point = {
  x: number;
  y: number;
};

type Palette = {
  snow: string;
  light: string;
  mid: string;
  dark: string;
  accent: string;
};

type Props = {
  className?: string;
  width: number;
  height: number;
  ridge: Point[];
  palette: Palette;
  snowDepth?: number;
  snowLine?: number;
};

type Run = {
  x: number;
  y: number;
  width: number;
  fill: string;
};

function interpolateRidge(width: number, points: Point[]) {
  return Array.from({ length: width }, (_, x) => {
    const nextIndex = points.findIndex((point) => point.x >= x);
    const right = points[nextIndex] ?? points[points.length - 1];
    const left = points[Math.max(0, nextIndex - 1)] ?? right;
    if (left.x === right.x) return left.y;
    const progress = (x - left.x) / (right.x - left.x);
    return Math.round(left.y + (right.y - left.y) * progress);
  });
}

function pixelNoise(x: number, y: number) {
  return (x * 37 + y * 19 + x * y * 7) % 17;
}

function pixelFill(
  x: number,
  y: number,
  ridge: number[],
  palette: Palette,
  snowDepth: number,
  snowLine: number,
) {
  const top = ridge[x] ?? y;
  const left = ridge[Math.max(0, x - 1)] ?? top;
  const right = ridge[Math.min(ridge.length - 1, x + 1)] ?? top;
  const depth = y - top;
  const slope = right - left;
  const noise = pixelNoise(x, y);
  const snowCap = top <= snowLine ? snowDepth + Math.floor((snowLine - top) / 2) : 0;

  if (depth <= snowCap && noise > 1) return palette.snow;
  if (snowCap > 0 && depth <= snowCap + 3 && noise > 10) return palette.accent;
  if (slope > 1) return noise > 13 ? palette.mid : palette.light;
  if (slope < -1) return noise > 12 ? palette.mid : palette.dark;
  if (noise === 0 || noise === 7) return palette.accent;
  return palette.mid;
}

function buildRuns(
  width: number,
  height: number,
  ridge: number[],
  palette: Palette,
  snowDepth: number,
  snowLine: number,
) {
  const runs: Run[] = [];
  for (let y = 0; y < height; y += 1) {
    let active: Run | null = null;
    for (let x = 0; x < width; x += 1) {
      if (y < ridge[x]) {
        if (active) runs.push(active);
        active = null;
        continue;
      }
      const fill = pixelFill(x, y, ridge, palette, snowDepth, snowLine);
      if (active && active.fill === fill) {
        active.width += 1;
        continue;
      }
      if (active) runs.push(active);
      active = { x, y, width: 1, fill };
    }
    if (active) runs.push(active);
  }
  return runs;
}

export function PixelMountain({
  className,
  width,
  height,
  ridge,
  palette,
  snowDepth = 3,
  snowLine = Math.floor(height * 0.38),
}: Props) {
  const ridgeLine = interpolateRidge(width, ridge);
  const runs = buildRuns(width, height, ridgeLine, palette, snowDepth, snowLine);

  return (
    <svg
      aria-hidden="true"
      className={className}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${width} ${height}`}
    >
      {runs.map((run) => (
        <rect
          key={`${run.x}-${run.y}-${run.width}-${run.fill}`}
          fill={run.fill}
          height="1"
          width={run.width}
          x={run.x}
          y={run.y}
        />
      ))}
    </svg>
  );
}
