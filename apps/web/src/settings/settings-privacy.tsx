import { useEffect, useState } from "react";
import { ConfirmModal } from "../components/confirm-modal";
import { Toast } from "../components/toast";
import { useHistory } from "../hooks/use-history";
import { useSearchHistory } from "../hooks/use-search-history";
import { useSettings } from "../hooks/use-settings";
import { useSubscriptions } from "../hooks/use-subscriptions";
import { ToggleSwitch } from "./settings-toggle-switch";

const SECTION_LABEL = "text-xs font-medium text-fg-soft uppercase tracking-wider px-1";
const CARD = "bg-surface rounded-xl border border-border overflow-hidden divide-y divide-border";
const ROW = "flex items-center justify-between px-4 py-4";

type ActiveModal = "history" | "subscriptions" | "search-history" | null;

export function SettingsPrivacy() {
  const { total: historyTotal, clear: clearHistory } = useHistory();
  const { query: subsQuery, remove: removeSubscription } = useSubscriptions();
  const { total: searchHistoryTotal, clear: clearSearchHistory } = useSearchHistory();
  const { settings, update } = useSettings();
  const subscriptions = subsQuery.data ?? [];
  const [modal, setModal] = useState<ActiveModal>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleConfirm() {
    const activeModal = modal;
    setModal(null);
    try {
      if (activeModal === "history") {
        await clearHistory.mutateAsync();
        setToast("Watch history cleared");
      }
      if (activeModal === "subscriptions") {
        for (const sub of subsQuery.data ?? []) {
          removeSubscription.mutate(sub.channelUrl);
        }
        setToast("Unsubscribed from all channels");
      }
      if (activeModal === "search-history") {
        await clearSearchHistory.mutateAsync();
        setToast("Search history cleared");
      }
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Action failed");
    }
  }

  const historyLabel = historyTotal === 1 ? "1 entry" : `${historyTotal} entries`;
  const subsLabel = subscriptions.length === 1 ? "1 channel" : `${subscriptions.length} channels`;
  const searchLabel = searchHistoryTotal === 1 ? "1 entry" : `${searchHistoryTotal} entries`;

  const modalTitle =
    modal === "history"
      ? `Clear ${historyLabel}?`
      : modal === "subscriptions"
        ? `Unsubscribe from ${subsLabel}?`
        : `Clear ${searchLabel}?`;
  const confirmLabel =
    modal === "history" ? "Clear" : modal === "subscriptions" ? "Unsubscribe all" : "Clear";

  return (
    <section className="flex flex-col gap-3">
      <p className={SECTION_LABEL}>Privacy</p>
      <div className={CARD}>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Watch history tracking</span>
            <span className="text-xs text-fg-soft">Save watched videos and playback progress</span>
          </div>
          <ToggleSwitch
            checked={!settings.disableWatchHistory}
            onClick={() => update.mutate({ disableWatchHistory: !settings.disableWatchHistory })}
          />
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Watch history</span>
            <span className="text-xs text-fg-soft">{historyLabel}</span>
          </div>
          <button
            type="button"
            disabled={historyTotal === 0}
            onClick={() => setModal("history")}
            className="text-xs text-danger hover:text-danger-strong disabled:text-fg-soft disabled:cursor-not-allowed transition-colors ml-6 flex-shrink-0"
          >
            Clear
          </button>
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Search history</span>
            <span className="text-xs text-fg-soft">{searchLabel}</span>
          </div>
          <button
            type="button"
            disabled={searchHistoryTotal === 0}
            onClick={() => setModal("search-history")}
            className="text-xs text-danger hover:text-danger-strong disabled:text-fg-soft disabled:cursor-not-allowed transition-colors ml-6 flex-shrink-0"
          >
            Clear
          </button>
        </div>
        <div className={ROW}>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-fg">Subscriptions</span>
            <span className="text-xs text-fg-soft">{subsLabel}</span>
          </div>
          <button
            type="button"
            disabled={subscriptions.length === 0}
            onClick={() => setModal("subscriptions")}
            className="text-xs text-danger hover:text-danger-strong disabled:text-fg-soft disabled:cursor-not-allowed transition-colors ml-6 flex-shrink-0"
          >
            Unsubscribe all
          </button>
        </div>
      </div>
      {modal !== null && (
        <ConfirmModal
          title={modalTitle}
          description="This action cannot be undone."
          confirmLabel={confirmLabel}
          onConfirm={handleConfirm}
          onCancel={() => setModal(null)}
        />
      )}
      <Toast message={toast} />
    </section>
  );
}
