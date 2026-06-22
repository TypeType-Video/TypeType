import { BadgeCheck } from "lucide-react";
import { formatSubscribers } from "../lib/format";
import { proxyImage } from "../lib/proxy";
import type { ChannelResultItem } from "../types/api";
import { AllowChannelButton } from "./allow-channel-button";
import { ChannelAvatar } from "./channel-avatar";
import { ChannelRouteLink } from "./channel-route-link";

type Props = {
  channel: ChannelResultItem;
};

export function SearchChannelCard({ channel }: Props) {
  return (
    <article className="flex flex-col items-center gap-2 text-center">
      <ChannelRouteLink url={channel.url} className="group flex w-full flex-col items-center gap-2">
        <div className="flex aspect-video w-full items-center justify-center">
          <ChannelAvatar
            src={proxyImage(channel.thumbnailUrl)}
            name={channel.name}
            className="h-24 w-24 transition-transform duration-200 group-hover:scale-105"
          />
        </div>
        <div className="min-w-0 px-1">
          <p className="flex items-center justify-center gap-1 text-sm font-medium text-fg group-hover:text-fg-strong">
            <span className="line-clamp-1">{channel.name}</span>
            {channel.isVerified && (
              <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-fg-muted" aria-hidden="true" />
            )}
          </p>
          <p className="mt-1 text-xs text-fg-muted">{formatSubscribers(channel.subscriberCount)}</p>
        </div>
      </ChannelRouteLink>
      <div className="min-h-7">
        <AllowChannelButton
          url={channel.url}
          name={channel.name}
          thumbnailUrl={channel.thumbnailUrl}
          compact
        />
      </div>
    </article>
  );
}
