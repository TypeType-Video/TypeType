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
