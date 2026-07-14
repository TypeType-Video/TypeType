import { normalizeClientLocale } from "./client-locale";

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const WEEK_MS = 7 * DAY_MS;
const MONTH_MS = 30 * DAY_MS;
const YEAR_MS = 365 * DAY_MS;

function normalizedLocale(locale: string | undefined): string {
  return normalizeClientLocale(locale) ?? "en";
}

function relativeLabel(unit: Intl.RelativeTimeFormatUnit, value: number, locale: string): string {
  const formatter = new Intl.RelativeTimeFormat(normalizedLocale(locale), { numeric: "auto" });
  return formatter.format(value, unit);
}

export function formatCommentPublishedTime(
  publishedAt: number | null | undefined,
  fallback: string,
  locale: string | undefined,
): string {
  const effectiveLocale = normalizedLocale(locale);
  if (typeof publishedAt !== "number" || !Number.isFinite(publishedAt) || publishedAt <= 0) {
    return fallback;
  }
  const diff = publishedAt - Date.now();
  const abs = Math.abs(diff);
  if (abs < MINUTE_MS)
    return relativeLabel("second", Math.round(diff / SECOND_MS), effectiveLocale);
  if (abs < HOUR_MS) return relativeLabel("minute", Math.round(diff / MINUTE_MS), effectiveLocale);
  if (abs < DAY_MS) return relativeLabel("hour", Math.round(diff / HOUR_MS), effectiveLocale);
  if (abs < WEEK_MS) return relativeLabel("day", Math.round(diff / DAY_MS), effectiveLocale);
  if (abs < MONTH_MS) return relativeLabel("week", Math.round(diff / WEEK_MS), effectiveLocale);
  if (abs < YEAR_MS) return relativeLabel("month", Math.round(diff / MONTH_MS), effectiveLocale);
  return relativeLabel("year", Math.round(diff / YEAR_MS), effectiveLocale);
}
