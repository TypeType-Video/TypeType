type ToggleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onClick: () => void;
};

type NumberRowProps = {
  title: string;
  description: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

export const PLAYBACK_ROW = "flex items-center justify-between px-4 py-4";

export function PlaybackToggleRow({ title, description, checked, onClick }: ToggleRowProps) {
  return (
    <div className={PLAYBACK_ROW}>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-fg">{title}</span>
        <span className="text-xs text-fg-soft">{description}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onClick}
        className={`relative ml-6 h-5 w-10 flex-shrink-0 rounded-full border transition-colors duration-200 ${
          checked ? "border-fg bg-fg" : "border-border-strong bg-surface-strong"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full transition-all duration-200 ${
            checked ? "translate-x-5 bg-surface" : "translate-x-0 bg-fg-muted"
          }`}
        />
      </button>
    </div>
  );
}

export function PlaybackNumberRow({
  title,
  description,
  value,
  min,
  max,
  onChange,
}: NumberRowProps) {
  return (
    <div className={PLAYBACK_ROW}>
      <div className="flex flex-col gap-1">
        <span className="text-sm text-fg">{title}</span>
        <span className="text-xs text-fg-soft">{description}</span>
      </div>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="ml-6 w-20 flex-shrink-0 rounded-lg border border-border-strong bg-surface-strong px-3 py-1.5 text-right text-fg text-xs outline-none focus:ring-1 focus:ring-border-strong"
      />
    </div>
  );
}
