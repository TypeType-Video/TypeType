export function PlaylistsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-32 text-center">
      <p className="text-fg-muted text-sm">No playlists yet.</p>
      <p className="text-fg-soft text-xs">Use the New playlist button to get started.</p>
    </div>
  );
}
