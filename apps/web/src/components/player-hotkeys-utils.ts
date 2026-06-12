export function isInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  return Boolean(
    target.closest(
      "a, button, input, textarea, select, summary, [contenteditable='true'], [role='button'], [role='menuitem'], [role='slider']",
    ),
  );
}

export function clampTime(value: number, duration: number): number {
  const max = duration > 0 ? duration : Number.POSITIVE_INFINITY;
  return Math.min(max, Math.max(0, value));
}

export function consumeEvent(event: KeyboardEvent) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

export function consumePointerEvent(event: PointerEvent) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

export function isMobilePointer(event: PointerEvent): boolean {
  return event.pointerType === "touch" || event.pointerType === "pen";
}
