import { useState } from "react";
import { RichText } from "./rich-text";

type Props = {
  description: string;
  onSeekTimestamp?: (seconds: number) => void;
};

export function WatchDescription({ description, onSeekTimestamp }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <div className="w-full rounded-xl bg-surface px-4 py-3 text-left transition-colors hover:bg-surface-strong">
        <p className="text-sm text-fg leading-relaxed line-clamp-3 whitespace-pre-wrap">
          <RichText text={description} onSeekTimestamp={onSeekTimestamp} />
        </p>
        <button
          type="button"
          className="mt-2 block text-xs font-medium text-fg-muted hover:text-fg transition-colors"
          onClick={() => setExpanded(true)}
        >
          Show more
        </button>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl px-4 py-3">
      <p className="text-sm text-fg leading-relaxed whitespace-pre-wrap">
        <RichText text={description} onSeekTimestamp={onSeekTimestamp} />
      </p>
      <button
        type="button"
        className="mt-3 text-xs font-medium text-fg-muted hover:text-fg transition-colors"
        onClick={() => setExpanded(false)}
      >
        Show less
      </button>
    </div>
  );
}
