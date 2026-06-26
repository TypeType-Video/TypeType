function isTouchMac(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const desktopModeIpad = /Macintosh/.test(ua) && /Mobile\//.test(ua);
  return desktopModeIpad || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isWebKitEngine(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const hasWebKit = /AppleWebKit/i.test(ua);
  const otherIosBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
  return hasWebKit && !otherIosBrowser;
}

export function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPhone|iPad|iPod/.test(navigator.userAgent) || isTouchMac();
}

export function isIosWebKitBrowser(): boolean {
  return isIosDevice() && isWebKitEngine();
}

export function isIosStandaloneApp(): boolean {
  if (!isIosDevice()) return false;
  if (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }
  if (typeof navigator === "undefined" || !("standalone" in navigator)) return false;
  return typeof navigator.standalone === "boolean" && navigator.standalone;
}
