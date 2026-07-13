export function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return Boolean(
    target.closest(
      "a, button, input, textarea, select, summary, [contenteditable='true'], [role='button'], [role='menuitem'], [role='slider']",
    ),
  );
}

export function isPlayerSeekShortcutTarget(
  target: EventTarget | null,
  player: HTMLElement | null,
): boolean {
  if (!isInteractiveTarget(target)) return true;
  if (!(target instanceof HTMLElement) || !player?.contains(target)) return false;
  const slider = target.closest<HTMLElement>("[role='slider']");
  if (slider && !slider.classList.contains("vds-time-slider")) return false;
  return !target.closest(
    "input, textarea, select, [contenteditable='true'], [role='menu'], [role='menuitem'], [role='listbox'], [role='option']",
  );
}

export function clampTime(value: number, duration: number): number {
  const max = duration > 0 ? duration : Number.POSITIVE_INFINITY;
  return Math.min(max, Math.max(0, value));
}

export function keyboardSeekOffset(code: string): number | null {
  if (code === "ArrowLeft") return -10;
  if (code === "ArrowRight") return 10;
  return null;
}

export type KeyboardSeekTarget = {
  position: number;
  updatedAt: number;
};

export function nextKeyboardSeekTarget(
  currentTime: number,
  duration: number,
  offset: number,
  previous: KeyboardSeekTarget,
  now: number,
): KeyboardSeekTarget {
  const base = now - previous.updatedAt <= 1_000 ? previous.position : currentTime;
  return { position: clampTime(base + offset, duration), updatedAt: now };
}

export function consumeEvent(event: KeyboardEvent) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

export function consumePointerEvent(event: PointerEvent) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

export function isFastForwardPointer(event: PointerEvent): boolean {
  if (event.pointerType === "mouse") return event.button === 0;
  return event.pointerType === "touch" || event.pointerType === "pen";
}

const DRAG_THRESHOLD = 12;

export function exceededDragThreshold(dx: number, dy: number): boolean {
  return Math.abs(dx) >= DRAG_THRESHOLD && Math.abs(dx) > Math.abs(dy);
}

export function computeScrubTarget(
  startTime: number,
  dx: number,
  width: number,
  range: number,
  duration: number,
): number {
  if (width <= 0) return clampTime(startTime, duration);
  return clampTime(startTime + (dx / width) * range, duration);
}
