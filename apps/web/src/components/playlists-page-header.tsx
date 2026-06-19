type Props = {
  selectionMode: boolean;
  selectedCount: number;
  canSelect: boolean;
  onSelect: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onCreate: () => void;
};

export function PlaylistsPageHeader({
  selectionMode,
  selectedCount,
  canSelect,
  onSelect,
  onCancel,
  onDelete,
  onCreate,
}: Props) {
  const base =
    "rounded-lg bg-surface-strong px-3 py-2 text-sm transition-colors hover:bg-surface-soft";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="font-semibold text-fg text-lg">Playlists</h1>
      <div className="flex items-center gap-2">
        {selectionMode ? (
          <>
            <span className="text-fg-soft text-xs">{selectedCount} selected</span>
            <button type="button" onClick={onCancel} className={`${base} text-fg-muted`}>
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={onDelete}
              className="rounded-lg bg-danger px-3 py-2 text-sm text-white transition-colors hover:bg-danger disabled:cursor-not-allowed disabled:opacity-40"
            >
              Delete ({selectedCount})
            </button>
          </>
        ) : (
          <>
            {canSelect && (
              <button
                type="button"
                onClick={onSelect}
                className={`${base} text-fg-muted hover:text-fg`}
              >
                Select
              </button>
            )}
            <button type="button" onClick={onCreate} className={`${base} text-fg`}>
              New playlist
            </button>
          </>
        )}
      </div>
    </div>
  );
}
