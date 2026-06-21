export type DogPhase = "intro" | "idle" | "dash" | "carry" | "exit" | "enter";

export const APPEAR_MS = 10000;
export const DOG_DELAY = 5200;
export const EDGE = 150;
export const MOVE_ON = 1.3;
export const MOVE_OFF = 0.4;

const GRAB_DIST = 72;
const TRIGGER = 200;
const RUN_SPEED = 9;
const ACCEL = 0.16;
const MARGIN = 70;
const COMFORT = 165;
const SLACK = 95;
const APPROACH_K = 0.06;
const DART_MIN = 2.2;
const DRIFT_SPEED = 5;
const EXIT_PUSH = 130;
const EXIT_NEAR = 120;

type Vec = { x: number; y: number };
type VecRef = { current: Vec };

export type DogContext = {
  w: number;
  h: number;
  p: Vec;
  v: Vec;
  c: Vec;
  ph: DogPhase;
  logo: DOMRect | undefined;
  target: VecRef;
  exitDir: VecRef;
  go: (next: DogPhase) => void;
};

export function advanceDog(ctx: DogContext): void {
  const { w, h, p, v, c, ph, logo, target, exitDir, go } = ctx;
  let dvx = 0;
  let dvy = 0;
  let clamp = false;
  if (ph === "intro") {
    const dx = w * 0.32 - p.x;
    const dy = h * 0.62 - p.y;
    const d = Math.hypot(dx, dy) || 1;
    dvx = (dx / d) * RUN_SPEED;
    dvy = (dy / d) * RUN_SPEED;
    if (d < 34) {
      go("idle");
    }
  } else if (ph === "idle") {
    clamp = true;
    if (logo) {
      const lx = logo.left + logo.width / 2;
      const ly = logo.top + logo.height / 2;
      if (Math.hypot(c.x - lx, c.y - ly) < TRIGGER) {
        go("dash");
      }
    }
  } else if (ph === "dash") {
    if (logo) {
      const dx = logo.left + logo.width / 2 - p.x;
      const dy = logo.top + logo.height / 2 - p.y;
      const d = Math.hypot(dx, dy) || 1;
      dvx = (dx / d) * RUN_SPEED;
      dvy = (dy / d) * RUN_SPEED;
      if (d < GRAB_DIST) {
        go("carry");
      }
    }
  } else if (ph === "carry") {
    const dx = p.x - c.x;
    const dy = p.y - c.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < COMFORT) {
      const s = Math.min(RUN_SPEED, (COMFORT - d) * APPROACH_K + DART_MIN);
      dvx = (dx / d) * s;
      dvy = (dy / d) * s;
      const near = p.x < EXIT_NEAR || p.x > w - EXIT_NEAR || p.y < EXIT_NEAR || p.y > h - EXIT_NEAR;
      if (d < EXIT_PUSH && near) {
        const dist = [p.x, w - p.x, p.y, h - p.y];
        const m = Math.min(dist[0], dist[1], dist[2], dist[3]);
        if (m === dist[0]) {
          exitDir.current = { x: -1, y: 0 };
        } else if (m === dist[1]) {
          exitDir.current = { x: 1, y: 0 };
        } else if (m === dist[2]) {
          exitDir.current = { x: 0, y: -1 };
        } else {
          exitDir.current = { x: 0, y: 1 };
        }
        go("exit");
      }
    } else if (d > COMFORT + SLACK) {
      const s = Math.min(DRIFT_SPEED, (d - COMFORT - SLACK) * APPROACH_K);
      dvx = -(dx / d) * s;
      dvy = -(dy / d) * s;
      clamp = true;
    } else {
      clamp = true;
    }
  } else if (ph === "exit") {
    dvx = exitDir.current.x * RUN_SPEED;
    dvy = exitDir.current.y * RUN_SPEED;
  } else if (ph === "enter") {
    const dx = target.current.x - p.x;
    const dy = target.current.y - p.y;
    const d = Math.hypot(dx, dy) || 1;
    dvx = (dx / d) * RUN_SPEED;
    dvy = (dy / d) * RUN_SPEED;
    if (d < 44) {
      go("carry");
    }
  }
  v.x += (dvx - v.x) * ACCEL;
  v.y += (dvy - v.y) * ACCEL;
  p.x += v.x;
  p.y += v.y;
  if (clamp) {
    if (p.x < MARGIN) {
      p.x = MARGIN;
      v.x = 0;
    } else if (p.x > w - MARGIN) {
      p.x = w - MARGIN;
      v.x = 0;
    }
    if (p.y < MARGIN) {
      p.y = MARGIN;
      v.y = 0;
    } else if (p.y > h - MARGIN) {
      p.y = h - MARGIN;
      v.y = 0;
    }
    return;
  }
  if (ph === "exit" && (p.x < -EDGE || p.x > w + EDGE || p.y < -EDGE || p.y > h + EDGE)) {
    const side = Math.floor(Math.random() * 4);
    const rx = MARGIN + Math.random() * (w - 2 * MARGIN);
    const ry = MARGIN + Math.random() * (h - 2 * MARGIN);
    const into = 130 + Math.random() * 180;
    if (side === 0) {
      p.x = rx;
      p.y = -EDGE;
      target.current = { x: rx, y: into };
    } else if (side === 1) {
      p.x = rx;
      p.y = h + EDGE;
      target.current = { x: rx, y: h - into };
    } else if (side === 2) {
      p.x = -EDGE;
      p.y = ry;
      target.current = { x: into, y: ry };
    } else {
      p.x = w + EDGE;
      p.y = ry;
      target.current = { x: w - into, y: ry };
    }
    go("enter");
  }
}
