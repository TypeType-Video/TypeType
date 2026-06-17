import { Play, Shuffle } from "lucide-react";

type Props = {
  onPlayAll: () => void;
  onShuffle: () => void;
};

export function PlaylistActions({ onPlayAll, onShuffle }: Props) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPlayAll}
        className="inline-flex items-center gap-1.5 rounded-lg bg-fg px-3 py-1.5 font-medium text-app text-xs transition-colors hover:bg-fg-strong"
      >
        <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
        Play all
      </button>
      <button
        type="button"
        onClick={onShuffle}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-3 py-1.5 font-medium text-fg text-xs transition-colors hover:bg-surface-strong"
      >
        <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
        Shuffle
      </button>
    </div>
  );
}
