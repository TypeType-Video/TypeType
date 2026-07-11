import { Link } from "@tanstack/react-router";
import { useState } from "react";

type Props = {
  kind: "favorites" | "watch-later";
  title: string;
  count: number;
  thumbnail?: string;
};

function EmptyLibraryIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={32}
      height={32}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Collection"
      className="text-fg-soft"
    >
      <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function LibraryCollectionCard({ kind, title, count, thumbnail }: Props) {
  const [failedThumbnail, setFailedThumbnail] = useState<string | null>(null);
  const showThumbnail = Boolean(thumbnail) && failedThumbnail !== thumbnail;
  const label = `${count} video${count !== 1 ? "s" : ""}`;
  const body = (
    <div className="flex flex-col gap-2 group">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-strong">
        {showThumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={() => setFailedThumbnail(thumbnail ?? null)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <EmptyLibraryIcon />
          </div>
        )}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {label}
        </span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-fg transition-colors group-hover:text-fg-strong">
          {title}
        </p>
        <p className="text-xs text-fg-soft">{label}</p>
      </div>
    </div>
  );

  return kind === "favorites" ? (
    <Link to="/favorites">{body}</Link>
  ) : (
    <Link to="/watch-later">{body}</Link>
  );
}
