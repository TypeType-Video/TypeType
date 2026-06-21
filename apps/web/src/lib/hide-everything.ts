const FLAG = "type-hide-everything";

export function allowHideEverything() {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(FLAG, "1");
  }
}

export function canEnterHideEverything() {
  return typeof window !== "undefined" && window.sessionStorage.getItem(FLAG) === "1";
}
