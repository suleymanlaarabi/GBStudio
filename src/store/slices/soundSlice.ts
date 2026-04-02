import type { StateCreator } from "zustand";
import type { SoundAsset, SoundChannelType } from "../../types";

export interface SoundSlice {
  sounds: SoundAsset[];
  selectedSoundId: string | null;
  addSound: (name: string, type: SoundChannelType) => void;
  updateSound: (soundId: string, updates: Partial<SoundAsset>) => void;
  removeSound: (soundId: string) => void;
  setSelectedSoundId: (soundId: string | null) => void;
}

type SoundState = SoundSlice & {
  commit: () => void;
};

export const createSoundSlice: StateCreator<
  SoundState,
  [],
  [],
  SoundSlice
> = (set, get) => ({
  sounds: [],
  selectedSoundId: null,

  addSound: (name, type) => {
    const newSoundId = crypto.randomUUID();
    const newSound: SoundAsset = {
      id: newSoundId,
      name,
      type,
    };

    // Initialize with default values based on type
