export function normalizeClientLocale(locale: string | undefined): string | undefined {
  if (!locale || locale.trim().length === 0) return undefined;
  try {
    return Intl.getCanonicalLocales(locale)[0];
  } catch {
    return undefined;
  }
}
