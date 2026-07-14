import { useEffect, useState } from "react";
import { normalizeClientLocale } from "../lib/client-locale";

export function useClientLocale() {
  const [locale, setLocale] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setLocale(normalizeClientLocale(navigator.language));
  }, []);

  return locale;
}
