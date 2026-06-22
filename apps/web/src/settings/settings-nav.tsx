import type { SettingsSection } from "../lib/settings-section";

type Item = {
  key: SettingsSection;
  label: string;
};

type Props = {
  items: Item[];
  active: SettingsSection;
  onSelect: (section: SettingsSection) => void;
};

export function SettingsNav({ items, active, onSelect }: Props) {
  return (
    <nav className="overflow-x-auto" aria-label="Settings sections">
      <div className="flex min-w-max gap-3 sm:grid sm:min-w-0 sm:grid-cols-8 sm:gap-1">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              aria-current={isActive ? "page" : undefined}
              onClick={() => onSelect(item.key)}
              className={`shrink-0 border-b px-1 py-2 text-left font-mono text-xs uppercase tracking-[0.16em] transition-colors ${
                isActive
                  ? "border-border text-fg"
                  : "border-border text-fg-soft hover:border-border-strong hover:text-fg-muted"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
