import { useNavigate } from "@tanstack/react-router";
import { toDirectWatchUrl } from "../lib/direct-watch-url";
import { markWatchAutoplayIntent } from "../lib/watch-autoplay-intent";
import { useSearchHistory } from "./use-search-history";
import { useSettings } from "./use-settings";

type Params = {
  onClose: () => void;
};

export function useSearchOverlayNavigation({ onClose }: Params) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const service = settings.defaultService;
  const { add } = useSearchHistory();

  function navigateAndClose(term: string) {
    const trimmed = term.trim();
    if (!trimmed) return;
    const directWatchUrl = toDirectWatchUrl(trimmed);
    if (directWatchUrl) {
      markWatchAutoplayIntent();
      navigate({ to: "/watch", search: { v: directWatchUrl } });
      onClose();
      return;
    }
    add.mutate(trimmed);
    navigate({ to: "/search", search: { q: trimmed, service } });
    onClose();
  }

  return { service, navigateAndClose };
}
