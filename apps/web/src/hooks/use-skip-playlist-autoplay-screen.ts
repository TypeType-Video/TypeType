import { useSyncExternalStore } from "react";
import {
  readSkipPlaylistAutoplayScreen,
  setSkipPlaylistAutoplayScreen as setStoredSkipPlaylistAutoplayScreen,
  subscribeSkipPlaylistAutoplayScreen,
} from "../lib/playlist-autoplay-screen";

export function useSkipPlaylistAutoplayScreen(): {
  skipPlaylistAutoplayScreen: boolean;
  setSkipPlaylistAutoplayScreen: (enabled: boolean) => void;
} {
  const skipPlaylistAutoplayScreen = useSyncExternalStore<boolean>(
    subscribeSkipPlaylistAutoplayScreen,
    readSkipPlaylistAutoplayScreen,
    readSkipPlaylistAutoplayScreen,
  );

  return {
    skipPlaylistAutoplayScreen,
    setSkipPlaylistAutoplayScreen: setStoredSkipPlaylistAutoplayScreen,
  };
}
