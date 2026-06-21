export const ROW = "flex items-center justify-between gap-4 px-4 py-4";

export function ToggleSwitch({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onClick}
      className={`relative h-5 w-10 flex-shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-fg" : "bg-surface-soft"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full transition-all duration-200 ${
          checked ? "translate-x-5 bg-surface" : "translate-x-0 bg-surface-soft"
        }`}
      />
    </button>
  );
}
