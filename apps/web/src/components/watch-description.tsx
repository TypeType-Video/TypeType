import { useState } from "react";
import { useClientLocale } from "../hooks/use-client-locale";
import { formatExactDate } from "../lib/format";
import { RichText } from "./rich-text";

type Props = {
  description: string;
  uploadedAt?: number;
  onSeekTimestamp?: (seconds: number) => void;
};

export function WatchDescription({ description, uploadedAt, onSeekTimestamp }: Props) {
  const [expanded, setExpanded] = useState(false);
  const locale = useClientLocale();
  const exactDate = formatExactDate(uploadedAt, locale);

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
      {exactDate && <p className="mb-2 text-xs font-medium text-fg-muted">{exactDate}</p>}
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
