let pending = false;
let installed = false;

export function markWatchAutoplayIntent(): void {
  pending = true;
}

export function consumeWatchAutoplayIntent(): boolean {
  if (!pending) return false;
  pending = false;
  return true;
}

export function installWatchAutoplayIntent(): void {
  if (installed || typeof document === "undefined") return;
  installed = true;
  document.addEventListener(
    "click",
    (event) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      const target = new URL(anchor.href, window.location.href);
      if (target.origin === window.location.origin && target.pathname === "/watch") {
        markWatchAutoplayIntent();
      }
    },
    { capture: true },
  );
}
