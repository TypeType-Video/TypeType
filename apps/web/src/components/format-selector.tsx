import { useRef } from "react";
import { activeFamily, groupByFamily } from "../lib/quality-utils";
import type { MenuInstance } from "../lib/vidstack";
import {
  DefaultMenuButton,
  DefaultMenuRadioGroup,
  Menu,
  useVideoQualityOptions,
} from "../lib/vidstack";

const FORMAT_OPTIONS: { label: string; value: "H.264" | "VP9" }[] = [
  { label: "H.264", value: "H.264" },
  { label: "VP9", value: "VP9" },
];
const MENU_ITEMS_CLASS =
  "vds-menu-items overflow-y-auto overscroll-y-contain pr-0.5 [scrollbar-width:thin] [scrollbar-color:var(--color-zinc-500)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-surface-soft/80 [&::-webkit-scrollbar-thumb:hover]:bg-surface-soft [&::-webkit-scrollbar-track]:bg-transparent";

export function FormatSelector() {
  const menuRef = useRef<MenuInstance>(null);
  const options = useVideoQualityOptions({ sort: "descending" });

  const videoOptions = options.filter((o) => o.quality !== null);
  const groups = groupByFamily(videoOptions);
  const current = activeFamily(videoOptions) ?? "H.264";
  const availableOptions = FORMAT_OPTIONS.filter((f) => groups.has(f.value));

  if (groups.size <= 1) return null;

  function onChange(value: string) {
    const best = groups.get(value as "H.264" | "VP9");
    if (best) best.select();
    menuRef.current?.close();
  }

  return (
    <Menu.Root ref={menuRef} className="vds-format-menu vds-menu">
      <DefaultMenuButton label="Format" hint={current} />
      <Menu.Items className={MENU_ITEMS_CLASS}>
        <DefaultMenuRadioGroup value={current} options={availableOptions} onChange={onChange} />
      </Menu.Items>
    </Menu.Root>
  );
}
