const MAX_UPDATE_DEPTH = "Maximum update depth exceeded";

declare global {
  var typetypeVidstackReactWarningFilterInstalled: boolean | undefined;
}

function isVidstackMaximumUpdateWarning(args: Parameters<typeof console.error>): boolean {
  const first = args[0];
  if (typeof first !== "string" || !first.includes(MAX_UPDATE_DEPTH)) return false;
  const stack = new Error().stack ?? "";
  return stack.includes("vidstack-") || stack.includes("@vidstack");
}

export function installConsoleWarningFilter() {
  if (globalThis.typetypeVidstackReactWarningFilterInstalled) return;
  globalThis.typetypeVidstackReactWarningFilterInstalled = true;
  const originalError = console.error.bind(console);
  console.error = (...args: Parameters<typeof console.error>) => {
    if (isVidstackMaximumUpdateWarning(args)) return;
    originalError(...args);
  };
}
