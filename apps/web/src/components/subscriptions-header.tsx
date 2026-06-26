import { Link } from "@tanstack/react-router";

type Props = {
  active: "videos" | "channels";
  count: number;
  onVideosIntent?: () => void;
  onChannelsIntent?: () => void;
};

function linkClass(active: boolean): string {
  return active
    ? "border-fg text-fg"
    : "border-transparent text-fg-muted hover:border-border-strong hover:text-fg";
}

export function SubscriptionsHeader({ active, count, onVideosIntent, onChannelsIntent }: Props) {
  return (
    <header className="flex flex-col gap-5 border-border border-b pt-3 pb-5 sm:flex-row sm:items-end sm:justify-between sm:pt-4">
      <div className="min-w-0">
        <p className="text-[11px] text-fg-soft uppercase tracking-[0.22em]">Library</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-fg">Subscriptions</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {count} {count === 1 ? "channel" : "channels"} followed
        </p>
      </div>
      <nav className="flex gap-6" aria-label="Subscription views">
        <Link
          to="/subscriptions"
          preload="intent"
          onFocus={onVideosIntent}
          onMouseEnter={onVideosIntent}
          onTouchStart={onVideosIntent}
          className={`border-b pb-1.5 text-sm font-medium transition-colors ${linkClass(active === "videos")}`}
        >
          Videos
        </Link>
        <Link
          to="/subscriptions/channels"
          preload="intent"
          onFocus={onChannelsIntent}
          onMouseEnter={onChannelsIntent}
          onTouchStart={onChannelsIntent}
          className={`border-b pb-1.5 text-sm font-medium transition-colors ${linkClass(active === "channels")}`}
        >
          Channels
        </Link>
      </nav>
    </header>
  );
}
