const WIDTH = 256;
const HEIGHT = 112;
const DIRT_TOP = 66;

const GRASS = "#a2c255";
const GRASS_DARK = "#8ba949";
const DIRT = "#7f4c30";
const DIRT_LIGHT = "#955734";
const DIRT_DARK = "#653c27";

type Run = {
  x: number;
  y: number;
  width: number;
  fill: string;
};

type Hump = {
  cx: number;
  r: number;
  top: number;
};

function rand(seed: number) {
  const v = Math.sin(seed * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}

function cell(x: number, y: number, size: number, salt: number) {
  return rand(Math.floor(x / size) * 131.7 + Math.floor(y / size) * 57.3 + salt);
}

function buildHumps() {
  const humps: Hump[] = [];
  let x = -4;
  let i = 1;
  while (x < WIDTH + 8) {
    humps.push({
      cx: x,
      r: 7 + Math.floor(rand(i) * 7),
      top: 6 + Math.floor(rand(i * 2 + 3) * 16),
    });
    x += 5 + Math.floor(rand(i * 3 + 1) * 6);
    i += 1;
  }
  return humps;
}

function canopyAt(x: number, humps: Hump[]) {
  let top = 28;
  for (const hump of humps) {
    const dx = Math.abs(x - hump.cx);
    if (dx > hump.r) continue;
    const y = hump.top + Math.round((dx / hump.r) * (28 - hump.top));
    if (y < top) top = y;
  }
  return top;
}

function dirtTopAt(x: number) {
  const step = Math.floor(cell(x, 0, 6, 9) * 3);
  return DIRT_TOP - 3 + step * 3;
}

function fillAt(x: number, y: number, humps: Hump[]): string | null {
  const canopy = canopyAt(x, humps);
  if (y < canopy) return null;
  const dirtTop = dirtTopAt(x);
  if (y < dirtTop) {
    if (y <= canopy + 1) return GRASS;
    if (cell(x, y, 4, 1) > 0.76) return GRASS_DARK;
    if (y > dirtTop - 8 && cell(x, y, 4, 4) > 0.52) return GRASS_DARK;
    return GRASS;
  }
  if (y <= dirtTop + 2) return DIRT_DARK;
  if (cell(x, y, 5, 2) > 0.8) return DIRT_LIGHT;
  if (cell(x, y, 6, 5) < 0.15) return DIRT_DARK;
  return DIRT;
}

function buildRuns() {
  const humps = buildHumps();
  const runs: Run[] = [];
  for (let y = 0; y < HEIGHT; y += 1) {
    let active: Run | null = null;
    for (let x = 0; x < WIDTH; x += 1) {
      const fill = fillAt(x, y, humps);
      if (active && fill === active.fill) {
        active.width += 1;
        continue;
      }
      if (active) runs.push(active);
      active = fill ? { x, y, width: 1, fill } : null;
    }
    if (active) runs.push(active);
  }
  return runs;
}

export function PixelGround() {
  const runs = buildRuns();

  return (
    <svg
      aria-hidden="true"
      className="pixel-earth-rise absolute inset-x-0 bottom-0 h-[30%] w-full"
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
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
