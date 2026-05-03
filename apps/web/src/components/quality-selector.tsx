import { useRef } from "react";
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
  "vds-menu-items overflow-y-auto overscroll-y-contain pr-0.5 [scrollbar-width:thin] [scrollbar-color:var(--color-zinc-500)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-surface-soft/80 [&::-webkit-scrollbar-thumb:hover]:bg-surface-soft [&::-webkit-scrollbar-track]:bg-transparent";

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

export function QualitySelector() {
  const menuRef = useRef<MenuInstance>(null);
  const options = useVideoQualityOptions({ sort: "descending" });

  const videoOptions = options.filter((o) => o.quality !== null);
  const filteredOptions = collectResolutionOptions(videoOptions);

  if (filteredOptions.length <= 1) return null;
  if (filteredOptions.every((o) => (o.quality?.height ?? 0) === 0)) return null;

  const selected = filteredOptions.find((o) => o.selected) ?? filteredOptions[0];
  if (!selected) return null;
  const current = selected.label;

  const radioOptions = filteredOptions.map((o) => ({ label: o.label, value: qualityValue(o) }));

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
