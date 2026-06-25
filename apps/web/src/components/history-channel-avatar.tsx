import { proxyImage } from "../lib/proxy";
import type { HistoryItem } from "../types/user";
import { ChannelAvatar } from "./channel-avatar";

type HistoryChannelAvatarProps = {
  item: HistoryItem;
  className: string;
};

export function HistoryChannelAvatar({ item, className }: HistoryChannelAvatarProps) {
  return (
    <ChannelAvatar
      src={proxyImage(item.channelAvatar ?? "")}
      name={item.channelName}
      className={className}
    />
  );
}
