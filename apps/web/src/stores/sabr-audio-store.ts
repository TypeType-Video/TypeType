import { create } from "zustand";

export type SabrAudioOption = {
  id: string;
  label: string;
  language: string;
  original: boolean;
};

type SabrAudioStore = {
  streamId: string | null;
  options: SabrAudioOption[];
  selectedTrackId: string | null;
  setOptions: (streamId: string, options: SabrAudioOption[], fallbackId: string | null) => void;
  selectTrack: (streamId: string, trackId: string) => void;
};

export const useSabrAudioStore = create<SabrAudioStore>((set) => ({
  streamId: null,
  options: [],
  selectedTrackId: null,
  setOptions: (streamId, options, fallbackId) =>
    set((state) => {
      const currentId = state.streamId === streamId ? state.selectedTrackId : null;
      const selectedTrackId = options.some((option) => option.id === currentId)
        ? currentId
        : fallbackId;
      return { streamId, options, selectedTrackId };
    }),
  selectTrack: (streamId, trackId) =>
    set((state) => (state.streamId === streamId ? { selectedTrackId: trackId } : state)),
}));
