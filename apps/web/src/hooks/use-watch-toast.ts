import { useEffect, useState } from "react";

export function useWatchToast(audioOnlyUnavailable: boolean) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!audioOnlyUnavailable) return;
    setToast("Audio-only is unavailable for this video");
  }, [audioOnlyUnavailable]);

  return { toast, setToast };
}
