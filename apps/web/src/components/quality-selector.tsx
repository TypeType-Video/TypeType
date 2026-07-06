import type * as dashjs from "dashjs";
import { useRef } from "react";
import { useDashPlayerSnapshot } from "../lib/dash-player-store";
import { dashQualityOptions, selectDashTrack, selectedDashHeight } from "../lib/dash-video";
import type { DefaultLayoutIcon, MenuInstance } from "../lib/vidstack";
import {
  ClipIcon,
  DefaultMenuButton,
  DefaultMenuRadioGroup,
  Menu,
  useVideoQualityOptions,
} from "../lib/vidstack";

const qualityIcon: DefaultLayoutIcon = (props) => <ClipIcon {...props} />;
const MENU_ITEMS_CLASS =
  "vds-menu-items max-h-[44svh] overflow-y-auto overscroll-y-contain pr-0.5 md:max-h-72 [scrollbar-width:thin] [scrollbar-color:var(--color-zinc-500)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-surface-soft/80 [&::-webkit-scrollbar-thumb:hover]:bg-surface-soft [&::-webkit-scrollbar-track]:bg-transparent";
const QUALITY_OPTIONS = { sort: "descending" } as const;

type QualityOption = ReturnType<typeof useVideoQualityOptions>[number];

function qualityValue(option: QualityOption): string {
  return String(option.quality?.height ?? option.label);
}

function collectResolutionOptions(options: QualityOption[]): QualityOption[] {
  const grouped = new Map<string, QualityOption>();
  for (const option of options) {
    if (option.quality === null) continue;
    const value = qualityValue(option);
    const current = grouped.get(value);
    if (!current || option.selected) grouped.set(value, option);
  }
  return [...grouped.values()];
}

function activeDashTrack(
  player: dashjs.MediaPlayerClass,
  selectedVideoTrack: dashjs.MediaInfo | null,
): dashjs.MediaInfo | null {
  return selectedVideoTrack ?? player.getCurrentTrackFor("video");
}

export function QualitySelector() {
  const menuRef = useRef<MenuInstance>(null);
  const { player, selectedVideoTrack } = useDashPlayerSnapshot();
  const options = useVideoQualityOptions(QUALITY_OPTIONS);

  const dashTrack = player ? activeDashTrack(player, selectedVideoTrack) : null;
  if (player && dashTrack) {
    const dashPlayer = player;
    const activeTrack = dashTrack;
    const selectedHeight = selectedDashHeight(dashPlayer, activeTrack);
    const dashOptions = dashQualityOptions(activeTrack, selectedHeight);
    const selected = dashOptions.find((option) => option.selected) ?? dashOptions[0];

    if (dashOptions.length > 1 && selected) {
      function onDashChange(value: string) {
        const height = Number(value);
        if (!Number.isFinite(height)) return;
        selectDashTrack(dashPlayer, activeTrack, height);
        menuRef.current?.close();
      }

      return (
        <Menu.Root ref={menuRef} className="vds-quality-menu vds-menu">
          <DefaultMenuButton label="Quality" hint={selected.label} Icon={qualityIcon} />
          <Menu.Items className={MENU_ITEMS_CLASS}>
            <DefaultMenuRadioGroup
              value={selected.value}
              options={dashOptions.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              onChange={onDashChange}
            />
          </Menu.Items>
        </Menu.Root>
      );
    }
  }

  const videoOptions = options.filter((o) => o.quality !== null);
  const filteredOptions = collectResolutionOptions(videoOptions);
  const selected = filteredOptions.find((o) => o.selected) ?? filteredOptions[0];
  const radioOptions = filteredOptions.map((o) => ({ label: o.label, value: qualityValue(o) }));

  if (filteredOptions.length <= 1) return null;
  if (filteredOptions.every((o) => (o.quality?.height ?? 0) === 0)) return null;

  if (!selected) return null;
  const current = selected.label;

  function onChange(value: string) {
    filteredOptions.find((o) => qualityValue(o) === value)?.select();
    menuRef.current?.close();
  }

  return (
    <Menu.Root ref={menuRef} className="vds-quality-menu vds-menu">
      <DefaultMenuButton label="Quality" hint={current} Icon={qualityIcon} />
      <Menu.Items className={MENU_ITEMS_CLASS}>
        <DefaultMenuRadioGroup
          value={qualityValue(selected)}
          options={radioOptions}
          onChange={onChange}
        />
      </Menu.Items>
    </Menu.Root>
  );
}
