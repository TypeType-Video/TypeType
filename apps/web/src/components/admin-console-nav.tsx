import type { AdminSection } from "../lib/admin-console-section";

type Item = {
  key: AdminSection;
  label: string;
};

type Props = {
  items: Item[];
  active: AdminSection;
  onSelect: (section: AdminSection) => void;
};

export function AdminConsoleNav({ items, active, onSelect }: Props) {
  return (
    <nav className="min-w-0 overflow-x-auto pt-3" aria-label="Admin sections">
      <div className="flex min-w-max gap-3 sm:grid sm:min-w-0 sm:grid-cols-5 sm:gap-1">
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
