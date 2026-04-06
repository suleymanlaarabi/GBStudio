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
    if (type === "PULSE1") {
      newSound.pulse1 = {
        sweepTime: 0,
        sweepDirection: "UP",
        sweepShift: 0,
        duty: 2,
        length: 0,
        initialVolume: 10,
        envelopeDirection: "DOWN",
        envelopeSweep: 3,
        frequency: 440,
      };
    } else if (type === "PULSE2") {
      newSound.pulse2 = {
        duty: 2,
        length: 0,
