import type { CaptionStyles } from "../types/user";

const CAPTION_DEFAULTS: CaptionStyles = {
  fontFamily: "pro-sans",
  fontSize: "100%",
  textColor: "#ffffff",
  textOpacity: "100%",
  textShadow: "none",
  textBg: "#000000",
  textBgOpacity: "100%",
  displayBg: "#000000",
  displayBgOpacity: "0%",
};

export const EMPTY_CAPTION_STYLES: CaptionStyles = {
  fontFamily: "",
  fontSize: "",
  textColor: "",
  textOpacity: "",
  textShadow: "",
  textBg: "",
  textBgOpacity: "",
  displayBg: "",
  displayBgOpacity: "",
};

const CAPTION_STYLE_KEYS: (keyof CaptionStyles)[] = [
  "fontFamily",
  "fontSize",
  "textColor",
  "textOpacity",
  "textShadow",
  "textBg",
  "textBgOpacity",
  "displayBg",
  "displayBgOpacity",
];

function kebab(key: string): string {
  return key.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);
}

function storageKey(key: keyof CaptionStyles): string {
  return `vds-player:${kebab(key)}`;
}

function hexToRgb(hex: string): string {
  const option = new Option();
  option.style.color = hex;
  const match = option.style.color.match(/\((.*?)\)/);
  return match ? match[1].replace(/,/g, " ") : "255 255 255";
}

function percentToRatio(value: string): string {
  return (Number.parseInt(value, 10) / 100).toString();
}

function fontFamilyValue(value: string): string {
  switch (value) {
    case "mono-serif":
      return '"Courier New", Courier, "Nimbus Mono L", "Cutive Mono", monospace';
    case "mono-sans":
      return '"Deja Vu Sans Mono", "Lucida Console", Monaco, Consolas, "PT Mono", monospace';
    case "pro-sans":
      return 'Roboto, "Arial Unicode Ms", Arial, Helvetica, Verdana, "PT Sans Caption", sans-serif';
    case "casual":
      return '"Comic Sans MS", Impact, Handlee, fantasy';
    case "cursive":
      return '"Monotype Corsiva", "URW Chancery L", "Apple Chancery", "Dancing Script", cursive';
    case "capitals":
      return '"Arial Unicode Ms", Arial, Helvetica, Verdana, "Marcellus SC", sans-serif';
    default:
      return '"Times New Roman", Times, Georgia, Cambria, "PT Serif Caption", serif';
  }
}

function textShadowValue(value: string): string {
  switch (value) {
    case "drop shadow":
      return "rgb(34, 34, 34) 1.86389px 1.86389px 2.79583px, rgb(34, 34, 34) 1.86389px 1.86389px 3.72778px, rgb(34, 34, 34) 1.86389px 1.86389px 4.65972px";
    case "raised":
      return "rgb(34, 34, 34) 1px 1px, rgb(34, 34, 34) 2px 2px";
    case "depressed":
      return "rgb(204, 204, 204) 1px 1px, rgb(34, 34, 34) -1px -1px";
    case "outline":
      return "rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px, rgb(34, 34, 34) 0px 0px 1.86389px";
    default:
      return "";
  }
}

function cssVarValue(key: keyof CaptionStyles, value: string): string {
  switch (key) {
    case "fontFamily":
      return fontFamilyValue(value);
    case "fontSize":
    case "textOpacity":
    case "textBgOpacity":
    case "displayBgOpacity":
      return percentToRatio(value);
    case "textColor":
      return `rgb(${hexToRgb(value)} / var(--media-user-text-opacity, 1))`;
    case "textShadow":
      return textShadowValue(value);
    case "textBg":
      return `rgb(${hexToRgb(value)} / var(--media-user-text-bg-opacity, 1))`;
    default:
      return `rgb(${hexToRgb(value)} / var(--media-user-display-bg-opacity, 1))`;
  }
}

export function applyCaptionStyles(el: HTMLElement, styles: CaptionStyles): void {
  for (const key of CAPTION_STYLE_KEYS) {
    const value = styles[key];
    const varName = `--media-user-${kebab(key)}`;
    if (!value || value === CAPTION_DEFAULTS[key]) {
      el.style.removeProperty(varName);
      if (key === "fontFamily") el.style.removeProperty("--media-user-font-variant");
      continue;
    }
    if (key === "fontFamily") {
      el.style.setProperty("--media-user-font-variant", value === "capitals" ? "small-caps" : "");
    }
    el.style.setProperty(varName, cssVarValue(key, value));
  }
}

export function readCaptionStylesFromStorage(): CaptionStyles {
  const result: CaptionStyles = { ...EMPTY_CAPTION_STYLES };
  for (const key of CAPTION_STYLE_KEYS) {
    const stored = localStorage.getItem(storageKey(key));
    if (stored) result[key] = stored;
  }
  return result;
}

export function writeCaptionStylesToStorage(styles: CaptionStyles): void {
  for (const key of CAPTION_STYLE_KEYS) {
    const value = styles[key];
    if (value && value !== CAPTION_DEFAULTS[key]) {
      localStorage.setItem(storageKey(key), value);
    } else {
      localStorage.removeItem(storageKey(key));
    }
  }
}
