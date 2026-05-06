import { createFileRoute } from "@tanstack/react-router";

function PrivacyPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 pt-12">
      <div className="px-1">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-soft">Privacy</p>
        <h1 className="mt-2 font-mono text-2xl font-semibold tracking-tight text-fg">
          Manage stored data
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          Clear stored watch history, search history, subscriptions, and playback progress from this
          account.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-soft">Stored data</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-fg-muted">
          <li>Watch history.</li>
          <li>Search history.</li>
          <li>Subscriptions.</li>
          <li>Playback progress.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-border bg-surface/40 p-5">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-fg-soft">Controls</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-fg-muted">
          <li>Clear watch history in Settings.</li>
          <li>Clear search history in Settings.</li>
          <li>Unsubscribe from all channels in Settings.</li>
        </ul>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/privacy")({ component: PrivacyPage });
