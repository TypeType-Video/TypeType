import type { YoutubeRemoteInput, YoutubeRemotePhase } from "../hooks/use-youtube-remote-browser";
import { YoutubeIcon } from "./youtube-icon";
import { YoutubeRemoteBrowser } from "./youtube-remote-browser";

type Props = {
  browserOpen: boolean;
  authReady: boolean;
  isAuthed: boolean;
  enabled: boolean;
  loaded: boolean;
  pending: boolean;
  connected: boolean;
  returnTo?: string;
  frameUrl: string | null;
  phase: YoutubeRemotePhase;
  error: string | null;
  onStart: () => void;
  onCancel: () => void;
  onInput: (input: YoutubeRemoteInput) => void;
};

export function YoutubeSessionBrowserPanel({
  browserOpen,
  authReady,
  isAuthed,
  enabled,
  loaded,
  pending,
  connected,
  returnTo,
  frameUrl,
  phase,
  error,
  onStart,
  onCancel,
  onInput,
}: Props) {
  if (browserOpen) {
    return (
      <div className="flex flex-col gap-3">
        <YoutubeRemoteBrowser frameUrl={frameUrl} phase={phase} error={error} onInput={onInput} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-fg-soft text-xs">
            Phase: {phase.replace(/_/g, " ")}. Click the browser area before typing.
          </p>
          <button
            type="button"
            onClick={onCancel}
            className="h-10 border border-border-strong px-4 text-fg-muted text-sm transition-colors hover:border-danger hover:text-danger"
          >
            Cancel sign-in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl border-border border-l-2 pl-5">
      <p className="text-fg text-sm leading-6">
        Use a secondary YouTube account. The remote browser is temporary and closes after
        connection, timeout, or cancellation.
      </p>
      <button
        type="button"
        disabled={!authReady || !isAuthed || !enabled || pending}
        onClick={onStart}
        className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 border border-white bg-white px-5 font-medium text-black text-sm transition-colors hover:bg-fg disabled:opacity-50 sm:w-auto"
      >
        <YoutubeIcon className="h-4 w-4 text-[#ff0000]" />
        <span>
          {!loaded ? "Checking availability..." : pending ? "Opening..." : "Connect with YouTube"}
        </span>
      </button>
      {loaded && !enabled && (
        <p className="mt-3 text-danger-strong text-xs">
          Remote YouTube login is disabled on this instance.
        </p>
      )}
      {connected && returnTo && (
        <a
          href={returnTo}
          className="mt-3 inline-flex h-11 w-full items-center justify-center border border-border-strong px-5 text-fg text-sm transition-colors hover:border-fg sm:ml-3 sm:w-auto"
        >
          Retry video
        </a>
      )}
    </div>
  );
}
