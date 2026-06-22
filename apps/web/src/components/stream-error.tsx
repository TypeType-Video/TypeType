import { Link, useRouter } from "@tanstack/react-router";
import { useAuth } from "../hooks/use-auth";
import { FAMILY_LIST_BLOCKED_MESSAGE } from "../lib/allow-list-error";
import { parseGeoRestriction } from "../lib/geo-restriction";
import { isMemberOnlyMessage } from "../lib/member-only";
import { FlagIcon } from "./flag-icon";
import { YoutubeIcon } from "./youtube-icon";

type Props = {
  message: string;
  onRetry?: () => void;
  youtubeSessionReturnTo?: string;
};

export function StreamError({ message, onRetry, youtubeSessionReturnTo }: Props) {
  const router = useRouter();
  const { canGlobalBlock } = useAuth();
  const countryCode = parseGeoRestriction(message);
  const isMemberOnly = isMemberOnlyMessage(message);
  const familyListBlocked = message === FAMILY_LIST_BLOCKED_MESSAGE;
  const imageSrc = familyListBlocked
    ? "/family-list-blocked.gif"
    : isMemberOnly
      ? "/member-only-source.gif"
      : "/error-cat.gif";

  return (
    <div className="fixed inset-0 bg-app flex flex-col items-center justify-center gap-5">
      <img
        src={imageSrc}
        width="220"
        height={familyListBlocked ? "181" : "220"}
        alt=""
        className="rounded-2xl"
      />
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-white text-base font-semibold tracking-tight">
          Couldn't load this video
        </p>
        <div className="flex items-center gap-2">
          {countryCode && <FlagIcon code={countryCode} className="w-5 h-4 rounded-sm shrink-0" />}
          <p className="text-fg-muted text-sm max-w-xs text-center">{message}</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-5 py-2 rounded-full bg-white hover:bg-fg text-app text-sm font-medium transition-colors cursor-pointer"
          >
            Retry
          </button>
        )}
        {youtubeSessionReturnTo && (
          <Link
            to="/youtube-session"
            search={{ returnTo: youtubeSessionReturnTo }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white hover:bg-fg text-app text-sm font-medium transition-colors cursor-pointer"
          >
            <YoutubeIcon className="h-4 w-4 text-[#ff0000]" />
            <span>Connect with YouTube</span>
          </Link>
        )}
        {familyListBlocked && canGlobalBlock && (
          <Link
            to="/admin-console"
            search={{ section: "allow-list" }}
            className="px-5 py-2 rounded-full bg-white hover:bg-fg text-app text-sm font-medium transition-colors cursor-pointer"
          >
            Open allow list
          </Link>
        )}
        <button
          type="button"
          onClick={() => router.history.back()}
          className="px-5 py-2 rounded-full bg-surface-strong hover:bg-surface-soft text-fg text-sm font-medium transition-colors cursor-pointer"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
