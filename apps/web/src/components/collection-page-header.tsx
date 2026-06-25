import { PlaylistActions } from "./playlist-actions";

type Props = {
  title: string;
  count: number;
  loading: boolean;
  canPlay: boolean;
  onPlayAll: () => void;
  onShuffle: () => void;
};

export function CollectionPageHeader({
  title,
  count,
  loading,
  canPlay,
  onPlayAll,
  onShuffle,
}: Props) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-lg font-semibold text-fg">{title}</h1>
        <p className="text-xs text-fg-soft">
          {loading ? "Loading videos" : `${count} video${count !== 1 ? "s" : ""}`}
        </p>
      </div>
      {canPlay && <PlaylistActions onPlayAll={onPlayAll} onShuffle={onShuffle} />}
    </header>
  );
}
