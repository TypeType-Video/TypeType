import { create } from "zustand";
import type { CodecFamily } from "../lib/quality-utils";

export type SabrQualityOption = {
  itag: number;
  label: string;
  height: number;
  codec: CodecFamily;
  codecValue: string;
  mimeType: string;
  width: number;
  fps: number;
  bitrate: number;
};

type SabrQualityStore = {
  streamId: string | null;
  options: SabrQualityOption[];
  selectedItag: number | null;
  manuallySelected: boolean;
  setOptions: (streamId: string, options: SabrQualityOption[], fallbackItag: number | null) => void;
  selectQuality: (streamId: string, itag: number) => void;
  restoreQuality: (streamId: string, itag: number) => void;
};

export const useSabrQualityStore = create<SabrQualityStore>((set) => ({
  streamId: null,
  options: [],
  selectedItag: null,
  manuallySelected: false,
  setOptions: (streamId, options, fallbackItag) =>
    set((state) => {
      const selectedItag = state.streamId === streamId ? state.selectedItag : null;
      const selectedExists = options.some((option) => option.itag === selectedItag);
      const preserveSelection = state.manuallySelected && selectedExists;
      return {
        streamId,
        options,
        selectedItag: preserveSelection ? selectedItag : fallbackItag,
        manuallySelected: preserveSelection,
      };
    }),
  selectQuality: (streamId, itag) =>
    set((state) =>
      state.streamId === streamId ? { selectedItag: itag, manuallySelected: true } : state,
    ),
  restoreQuality: (streamId, itag) =>
    set((state) =>
      state.streamId === streamId ? { selectedItag: itag, manuallySelected: false } : state,
    ),
}));
