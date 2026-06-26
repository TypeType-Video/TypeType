import { startTransition, useMemo, useState } from "react";
import { proxyImage } from "../lib/proxy";
import type { SubscriptionItem } from "../types/user";
import { ChannelAvatar } from "./channel-avatar";
import { ChannelRouteLink } from "./channel-route-link";
import { ScrollSentinel } from "./scroll-sentinel";

type Props = { subscriptions: SubscriptionItem[] };

const CHANNEL_BATCH_SIZE = 25;

export function SubscriptionChannelList({ subscriptions }: Props) {
  const [visibleCount, setVisibleCount] = useState(CHANNEL_BATCH_SIZE);
  const sorted = useMemo(
    () => [...subscriptions].sort((a, b) => a.name.localeCompare(b.name)),
    [subscriptions],
  );
  const visible = sorted.slice(0, Math.min(visibleCount, sorted.length));
  const hasMore = visibleCount < sorted.length;

  function loadMore() {
    startTransition(() => {
      setVisibleCount((count) => Math.min(count + CHANNEL_BATCH_SIZE, sorted.length));
    });
  }

  return (
    <>
      <section className="grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-5">
        {visible.map((item, index) => (
          <div
            key={item.channelUrl}
            className="animate-card-pop-in"
            style={{ animationDelay: `${Math.min((index % CHANNEL_BATCH_SIZE) * 16, 160)}ms` }}
          >
            <ChannelRouteLink
              url={item.channelUrl}
              className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl px-1.5 py-2 text-center transition-colors hover:bg-surface/55"
            >
              <span className="rounded-full p-1 transition-colors group-hover:bg-surface-strong/70">
                <ChannelAvatar
                  src={proxyImage(item.avatarUrl)}
                  name={item.name}
                  className="h-16 w-16 sm:h-[4.5rem] sm:w-[4.5rem]"
                />
              </span>
              <span className="flex min-w-0 flex-col items-center">
                <span className="line-clamp-2 text-sm font-medium leading-snug text-fg group-hover:text-fg-strong">
                  {item.name}
                </span>
              </span>
            </ChannelRouteLink>
          </div>
        ))}
      </section>
      {hasMore && (
        <div className="pt-2 text-center text-[11px] text-fg-soft">
          Showing {visible.length} of {sorted.length} channels
        </div>
      )}
      <ScrollSentinel enabled={hasMore} onIntersect={loadMore} />
    </>
  );
}
