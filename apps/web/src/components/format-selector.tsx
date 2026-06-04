import type * as dashjs from "dashjs";
import { useRef } from "react";
import { useDashPlayerSnapshot } from "../lib/dash-player-store";
import { dashTrackGroups, maxTrackHeight, selectDashTrack } from "../lib/dash-video";
import { activeFamily, type CodecFamily, codecFamily, groupByFamily } from "../lib/quality-utils";
import type { MenuInstance } from "../lib/vidstack";
import {
  DefaultMenuButton,
  DefaultMenuRadioGroup,
  Menu,
  useVideoQualityOptions,
} from "../lib/vidstack";

const FORMAT_ORDER: CodecFamily[] = ["H.264", "VP9", "AV1"];
const MENU_ITEMS_CLASS =
  "vds-menu-items overflow-y-auto overscroll-y-contain pr-0.5 [scrollbar-width:thin] [scrollbar-color:var(--color-zinc-500)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-surface-soft/80 [&::-webkit-scrollbar-thumb:hover]:bg-surface-soft [&::-webkit-scrollbar-track]:bg-transparent";

function isCodecFamily(value: string): value is CodecFamily {
  return value === "H.264" || value === "VP9" || value === "AV1";
}

function formatLabel(family: CodecFamily, track: dashjs.MediaInfo): string {
  const maxHeight = maxTrackHeight(track);
  return maxHeight > 0 ? `${family} ${maxHeight}p` : family;
}

export function FormatSelector() {
  const menuRef = useRef<MenuInstance>(null);
  const { player, selectedVideoTrack } = useDashPlayerSnapshot();
  const options = useVideoQualityOptions({ sort: "descending" });

  const videoOptions = options.filter((o) => o.quality !== null);
  const dashGroups = player ? dashTrackGroups(player) : null;

  if (player && dashGroups && dashGroups.size > 1) {
    const dashPlayer = player;
    const current = codecFamily(
      selectedVideoTrack?.codec ?? player.getCurrentTrackFor("video")?.codec ?? null,
    );
    const selected = current ?? FORMAT_ORDER.find((family) => dashGroups.has(family));
    const availableOptions = FORMAT_ORDER.flatMap((family) => {
      const track = dashGroups.get(family);
      if (!track) return [];
      return [{ label: formatLabel(family, track), value: family }];
    });

    if (!selected) return null;

    function onDashChange(value: string) {
      if (!isCodecFamily(value)) return;
      const track = dashGroups?.get(value);
      if (!track) return;
      selectDashTrack(dashPlayer, track);
      menuRef.current?.close();
    }

    return (
      <Menu.Root ref={menuRef} className="vds-format-menu vds-menu">
        <DefaultMenuButton label="Format" hint={selected} />
        <Menu.Items className={MENU_ITEMS_CLASS}>
          <DefaultMenuRadioGroup
            value={selected}
            options={availableOptions}
            onChange={onDashChange}
          />
        </Menu.Items>
      </Menu.Root>
    );
  }

  const groups = groupByFamily(videoOptions);
  const selected = activeFamily(videoOptions) ?? FORMAT_ORDER.find((family) => groups.has(family));
  const availableOptions = FORMAT_ORDER.filter((family) => groups.has(family)).map((family) => ({
    label: family,
    value: family,
  }));

  if (groups.size <= 1) return null;
  if (!selected) return null;

  function onChange(value: string) {
    if (!isCodecFamily(value)) return;
    groups.get(value)?.select();
    menuRef.current?.close();
  }

  return (
    <Menu.Root ref={menuRef} className="vds-format-menu vds-menu">
      <DefaultMenuButton label="Format" hint={selected} />
      <Menu.Items className={MENU_ITEMS_CLASS}>
        <DefaultMenuRadioGroup value={selected} options={availableOptions} onChange={onChange} />
      </Menu.Items>
    </Menu.Root>
  );
}
