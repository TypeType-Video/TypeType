import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toast } from "../components/toast";
import { YoutubeSessionBrowserPanel } from "../components/youtube-session-browser-panel";
import { YoutubeSessionInfoSection } from "../components/youtube-session-info-section";
import { YoutubeSessionStatusPanel } from "../components/youtube-session-status-panel";
import { useAuth } from "../hooks/use-auth";
import { useInstance } from "../hooks/use-instance";
import { useYoutubeRemoteBrowser } from "../hooks/use-youtube-remote-browser";
import { useYoutubeSession } from "../hooks/use-youtube-session";
import type { YoutubeRemoteBrowserSession } from "../lib/api-youtube-session";
import { recordClientEvent } from "../lib/client-debug-log";
import {
  sanitizeYoutubeSessionReturnTo,
  toYoutubeSessionWebSocketUrl,
} from "../lib/youtube-session-route";

const SIDE_LABEL = "font-mono text-fg-soft text-[11px] uppercase tracking-[0.22em]";

function YoutubeSessionPage() {
  const { returnTo } = Route.useSearch();
  const { authReady, isAuthed } = useAuth();
  const instance = useInstance();
  const session = useYoutubeSession();
  const [browserSession, setBrowserSession] = useState<YoutubeRemoteBrowserSession | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const state = session.status.data;
  const wsUrl = browserSession ? toYoutubeSessionWebSocketUrl(browserSession.wsUrl) : null;
  const remote = useYoutubeRemoteBrowser(wsUrl);
  const canDisconnect =
    authReady && isAuthed && state?.status !== "disconnected" && !session.disconnect.isPending;
  const connected = state?.status === "connected";
  const remoteLoginEnabled = instance.data?.youtubeRemoteLoginEnabled === true;

  const refetchStatus = session.status.refetch;

  useEffect(() => {
    if (remote.phase !== "connected") return;
    setBrowserSession(null);
    void refetchStatus();
    setToast("YouTube session connected");
  }, [remote.phase, refetchStatus]);

  function startRemoteBrowser() {
    recordClientEvent("youtube_remote.start_clicked", { hasReturnTo: !!returnTo });
    session.startBrowser.mutate(returnTo, {
      onSuccess: (next) => {
        recordClientEvent("youtube_remote.start_success", { expiresAt: next.expiresAt });
        setBrowserSession(next);
      },
      onError: (error) => {
        recordClientEvent("youtube_remote.start_error", {
          message: error instanceof Error ? error.message : "unknown",
        });
        setToast("Remote YouTube login is not available yet");
      },
    });
  }

  function cancelRemoteBrowser() {
    recordClientEvent("youtube_remote.cancel_clicked");
    remote.send({ type: "cancel" });
    if (!browserSession) return;
    session.cancelBrowser.mutate(browserSession.sessionId, {
      onSettled: () => setBrowserSession(null),
    });
  }

  function disconnect() {
    session.disconnect.mutate(undefined, {
      onSuccess: () => setToast("YouTube session disconnected"),
      onError: () => setToast("Could not disconnect YouTube session"),
    });
  }

  return (
    <div className="flex w-full max-w-none flex-col gap-8 pt-2 [animation:page-fade-in_0.2s_ease-out]">
      <div className="px-1">
        <Link to="/" className="w-fit text-fg-soft text-xs transition-colors hover:text-fg">
          Back home
        </Link>
      </div>

      <section className="grid min-h-[28rem] gap-10 border-border border-y py-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="flex min-w-0 flex-col justify-center gap-8">
          <p className={SIDE_LABEL}>YouTube remote sign-in</p>

          <div className="flex flex-col gap-3">
            <h1 className="max-w-4xl font-semibold text-3xl text-fg tracking-tight sm:text-5xl sm:leading-tight">
              Connect YouTube inside TypeType
            </h1>
            <p className="max-w-3xl text-base text-fg-muted leading-7 sm:text-lg">
              TypeType opens a temporary remote browser for YouTube sign-in. Cookies and playback
              token are captured server-side, encrypted, and never sent to the web UI.
            </p>
          </div>

          <YoutubeSessionBrowserPanel
            browserOpen={!!browserSession}
            authReady={authReady}
            isAuthed={isAuthed}
            enabled={remoteLoginEnabled}
            loaded={instance.isSuccess}
            pending={session.startBrowser.isPending}
            connected={connected}
            returnTo={returnTo}
            frameUrl={remote.frameUrl}
            phase={remote.phase}
            error={remote.error}
            onStart={startRemoteBrowser}
            onCancel={cancelRemoteBrowser}
            onInput={remote.send}
          />
        </div>

        <YoutubeSessionStatusPanel
          state={state}
          loading={session.status.isPending}
          canDisconnect={canDisconnect}
          onDisconnect={disconnect}
        />
      </section>

      <YoutubeSessionInfoSection labelClassName={SIDE_LABEL} />

      <Toast message={toast} />
    </div>
  );
}

export const Route = createFileRoute("/youtube-session")({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: sanitizeYoutubeSessionReturnTo(search.returnTo),
  }),
  component: YoutubeSessionPage,
});
