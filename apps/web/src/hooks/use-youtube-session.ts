import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelYoutubeSessionBrowser,
  disconnectYoutubeSession,
  fetchYoutubeSessionStatus,
  startYoutubeSessionBrowser,
} from "../lib/api-youtube-session";
import { useAuth } from "./use-auth";

const YOUTUBE_SESSION_KEY = ["youtube-session"];

export function useYoutubeSession() {
  const qc = useQueryClient();
  const { authReady, isAuthed } = useAuth();

  const status = useQuery({
    queryKey: YOUTUBE_SESSION_KEY,
    queryFn: fetchYoutubeSessionStatus,
    enabled: authReady && isAuthed,
  });

  const startBrowser = useMutation({
    mutationFn: startYoutubeSessionBrowser,
  });

  const cancelBrowser = useMutation({
    mutationFn: cancelYoutubeSessionBrowser,
  });

  const disconnect = useMutation({
    mutationFn: disconnectYoutubeSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: YOUTUBE_SESSION_KEY }),
  });

  return { status, startBrowser, cancelBrowser, disconnect };
}
