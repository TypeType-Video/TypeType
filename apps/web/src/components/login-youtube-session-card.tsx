import { Link } from "@tanstack/react-router";
import { useAuth } from "../hooks/use-auth";
import { useInstance } from "../hooks/use-instance";
import { useYoutubeSession } from "../hooks/use-youtube-session";
import {
  youtubeSessionStatusDescription,
  youtubeSessionStatusLabel,
} from "../lib/youtube-session-format";
import { YoutubeIcon } from "./youtube-icon";

export function LoginYoutubeSessionCard() {
  const { authReady, isAuthed, isGuest } = useAuth();
  const instance = useInstance();
  const session = useYoutubeSession();
  const enabled = instance.data?.youtubeRemoteLoginEnabled === true;
  const status = session.status.data?.status;
  const canOpen = authReady && isAuthed && !isGuest && enabled;
  const checking =
    !authReady || instance.isPending || (isAuthed && !isGuest && session.status.isPending);
  const actionLabel = status === "connected" ? "Manage YouTube session" : "Connect YouTube";
  const disabledLabel = checking
    ? "Checking availability..."
    : isAuthed && !isGuest
      ? "YouTube Session disabled"
      : "Sign in to TypeType first";

  return (
    <section className="w-full rounded-2xl border border-border bg-surface/80 p-6 shadow-xl md:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#ff0000]">
          <YoutubeIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-fg text-sm uppercase tracking-[0.18em]">
            YouTube Session
          </p>
          <h2 className="mt-2 text-2xl text-fg tracking-tight">
            Browser sign-in for fallback playback
          </h2>
        </div>
      </div>
      <p className="mt-5 text-fg-muted text-sm leading-6">
        TypeType only uses the connected YouTube session when anonymous stream loading fails.
        Cookies and playback tokens stay server-side.
      </p>
      <div className="mt-5 rounded-xl border border-border bg-app/70 p-4">
        <p className="font-medium text-fg text-sm">{youtubeSessionStatusLabel(status)}</p>
        <p className="mt-1 text-fg-soft text-sm">{youtubeSessionStatusDescription(status)}</p>
      </div>
      {canOpen ? (
        <Link
          to="/youtube-session"
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg bg-fg px-4 font-medium text-app text-sm transition-colors hover:bg-fg/90 sm:w-auto"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg bg-surface-strong px-4 font-medium text-fg-muted text-sm sm:w-auto"
        >
          {disabledLabel}
        </button>
      )}
      {instance.isSuccess && !enabled && (
        <p className="mt-3 text-danger-strong text-xs">
          YouTube remote login is disabled on this instance.
        </p>
      )}
    </section>
  );
}
