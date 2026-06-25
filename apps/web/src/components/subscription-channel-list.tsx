import { formatExactDate } from "../lib/format";
import { proxyImage } from "../lib/proxy";
import type { SubscriptionItem } from "../types/user";
import { ChannelAvatar } from "./channel-avatar";
import { ChannelRouteLink } from "./channel-route-link";

type Props = {
  subscriptions: SubscriptionItem[];
};

function subscribedLabel(timestamp: number): string {
  const date = formatExactDate(timestamp);
  return date ? `Subscribed ${date}` : "Subscribed";
}

export function SubscriptionChannelList({ subscriptions }: Props) {
  const sorted = [...subscriptions].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <section className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sorted.map((item) => (
        <ChannelRouteLink
          key={item.channelUrl}
          url={item.channelUrl}
          className="group flex min-w-0 items-center gap-3 rounded-xl border border-border bg-surface/60 p-3 transition-colors hover:border-border-strong hover:bg-surface"
        >
          <ChannelAvatar src={proxyImage(item.avatarUrl)} name={item.name} className="h-12 w-12" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-fg group-hover:text-fg-strong">
              {item.name}
            </span>
            <span className="mt-0.5 block truncate text-xs text-fg-soft">
              {subscribedLabel(item.subscribedAt)}
            </span>
          </span>
        </ChannelRouteLink>
      ))}
    </section>
  );
}
