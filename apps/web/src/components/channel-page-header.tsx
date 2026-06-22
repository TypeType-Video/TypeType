import { formatViews } from "../lib/format";
import { AllowChannelButton } from "./allow-channel-button";
import { ChannelAvatar } from "./channel-avatar";
import { VerifiedBadgeIcon } from "./watch-icons";

type Props = {
  sourceUrl: string;
  name: string;
  avatarUrl: string;
  bannerUrl: string;
  subscriberCount: number;
  isVerified: boolean;
  subscribed: boolean;
  onSubscribe: () => void;
};

export function ChannelPageHeader({
  sourceUrl,
  name,
  avatarUrl,
  bannerUrl,
  subscriberCount,
  isVerified,
  subscribed,
  onSubscribe,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      {bannerUrl && <img src={bannerUrl} alt="" className="h-32 w-full rounded-lg object-cover" />}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ChannelAvatar src={avatarUrl} name={name} className="h-14 w-14" />
          <div className="flex flex-col">
            <h1 className="flex items-center gap-1.5 text-lg font-semibold text-fg">
              {name}
              {isVerified && <VerifiedBadgeIcon />}
            </h1>
            <p className="text-sm text-fg-soft">{formatViews(subscriberCount)} subscribers</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <AllowChannelButton url={sourceUrl} name={name} thumbnailUrl={avatarUrl} compact />
          <button
            type="button"
            onClick={onSubscribe}
            aria-pressed={subscribed}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              subscribed
                ? "bg-surface-strong text-fg ring-1 ring-border-strong hover:bg-surface-soft"
                : "bg-fg text-app hover:bg-fg-strong"
            }`}
          >
            {subscribed ? "Subscribed" : "Subscribe"}
          </button>
        </div>
      </div>
    </div>
  );
}
