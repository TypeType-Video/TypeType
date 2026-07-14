import { useSettings } from "../hooks/use-settings";
import type { DeArrowThumbnailMode, DeArrowTitleMode, DeArrowTrustMode } from "../types/user";
import { ROW } from "./settings-toggle-switch";

const SELECT =
  "h-9 w-full rounded-md border border-border-strong bg-surface px-2.5 text-sm text-fg sm:w-52";

export function SettingsDeArrowOptions() {
  const { settings, update } = useSettings();
  if (!settings.deArrowEnabled) return null;

  return (
    <>
      <label className={ROW}>
        <span className="flex flex-col gap-1">
          <span className="text-sm text-fg">Titles</span>
          <span className="text-xs text-fg-soft">Choose the title shown for YouTube videos.</span>
        </span>
        <select
          aria-label="DeArrow titles"
          value={settings.deArrowTitleMode}
          onChange={(event) =>
            update.mutate({ deArrowTitleMode: event.target.value as DeArrowTitleMode })
          }
          className={SELECT}
        >
          <option value="dearrow">Community title</option>
          <option value="original">Original title</option>
        </select>
      </label>
      <label className={ROW}>
        <span className="flex flex-col gap-1">
          <span className="text-sm text-fg">Thumbnails</span>
          <span className="text-xs text-fg-soft">Choose the image shown for YouTube videos.</span>
        </span>
        <select
          aria-label="DeArrow thumbnails"
          value={settings.deArrowThumbnailMode}
          onChange={(event) =>
            update.mutate({ deArrowThumbnailMode: event.target.value as DeArrowThumbnailMode })
          }
          className={SELECT}
        >
          <option value="dearrow_or_random">Community, then neutral frame</option>
          <option value="dearrow">Community only</option>
          <option value="random">Neutral frame</option>
          <option value="original">Original thumbnail</option>
        </select>
      </label>
      <label className={ROW}>
        <span className="flex flex-col gap-1">
          <span className="text-sm text-fg">Confidence</span>
          <span className="text-xs text-fg-soft">Control which community entries are used.</span>
        </span>
        <select
          aria-label="DeArrow confidence"
          value={settings.deArrowTrustMode}
          onChange={(event) =>
            update.mutate({ deArrowTrustMode: event.target.value as DeArrowTrustMode })
          }
          className={SELECT}
        >
          <option value="accepted">Accepted entries</option>
          <option value="locked">Locked entries only</option>
        </select>
      </label>
    </>
  );
}
