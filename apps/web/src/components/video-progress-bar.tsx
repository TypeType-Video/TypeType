type Props = {
  progress: number;
  duration: number;
  className?: string;
  alwaysVisible?: boolean;
};

function progressPercent(progress: number, duration: number): number | null {
  if (!Number.isFinite(progress) || !Number.isFinite(duration) || duration <= 0) return null;
  return Math.min(100, Math.max(0, (progress / duration) * 100));
}

export function VideoProgressBar({ progress, duration, className, alwaysVisible = false }: Props) {
  const pct = progressPercent(progress, duration);
  if (pct === null || (!alwaysVisible && pct <= 0)) return null;

  return (
    <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-surface-soft ${className ?? ""}`}>
      <div className="h-full bg-danger-strong" style={{ width: `${pct}%` }} />
    </div>
  );
}
