export function ensurePlayerAlive(destroyed: boolean): void {
  if (destroyed) throw new Error("Player is destroyed");
}

export function ensureCurrentOperation(
  destroyed: boolean,
  revision: number,
  expectedRevision: number,
): void {
  if (destroyed || revision !== expectedRevision) {
    throw new DOMException("Operation aborted", "AbortError");
  }
}
