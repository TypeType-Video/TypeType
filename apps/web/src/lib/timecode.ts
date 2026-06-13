export function formatTimecode(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const remainingSeconds = safe % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function parseTimecode(value: string): number | null {
  const parts = value
    .trim()
    .split(":")
    .map((part) => Number(part));
  if (parts.length === 0 || parts.length > 3) return null;
  if (parts.some((part) => !Number.isFinite(part) || part < 0)) return null;
  if (parts.length === 1) return Math.floor(parts[0] ?? 0);
  if (parts.length === 2) return Math.floor((parts[0] ?? 0) * 60 + (parts[1] ?? 0));
  return Math.floor((parts[0] ?? 0) * 3600 + (parts[1] ?? 0) * 60 + (parts[2] ?? 0));
}
