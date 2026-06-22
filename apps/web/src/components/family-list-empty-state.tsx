import { Link } from "@tanstack/react-router";
import { useAuth } from "../hooks/use-auth";

type Props = {
  title?: string;
  description?: string;
  showSettingsAction?: boolean;
};

export function FamilyListEmptyState({
  title = "Nothing from the family list yet",
  description = "Add trusted channels so this page can stay focused on videos you picked for your family.",
  showSettingsAction = true,
}: Props) {
  const { canGlobalBlock } = useAuth();
  const showAdminAction = showSettingsAction && canGlobalBlock;
  return (
    <section className="rounded-xl border border-border bg-surface/80 px-5 py-6 text-center">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3">
        <span className="rounded-full border border-border bg-surface-soft px-3 py-1 text-[11px] font-medium text-fg-soft">
          Family list
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-fg">{title}</h2>
          <p className="text-xs leading-5 text-fg-soft">{description}</p>
        </div>
        {showAdminAction && (
          <Link
            to="/admin-console"
            search={{ section: "allow-list" }}
            className="mt-1 rounded-full bg-fg px-4 py-1.5 text-xs font-medium text-app transition-colors hover:bg-fg-strong"
          >
            Open allow list
          </Link>
        )}
      </div>
    </section>
  );
}
