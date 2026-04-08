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
        initialVolume: 10,
        envelopeDirection: "DOWN",
        envelopeSweep: 3,
        frequency: 440,
      };
    } else if (type === "WAVE") {
      newSound.wave = {
        dacEnabled: true,
        length: 0,
        volumeCode: 1,
        frequency: 440,
        waveData: Array(32).fill(0).map((_, i) => Math.floor(7.5 + 7.5 * Math.sin(i * Math.PI / 16))),
      };
    } else if (type === "NOISE") {
      newSound.noise = {
        length: 0,
        initialVolume: 10,
        envelopeDirection: "DOWN",
        envelopeSweep: 3,
        shiftClockFrequency: 0,
        counterStep: 0,
        dividingRatio: 0,
      };
    }

    set((state) => ({
      sounds: [...state.sounds, newSound],
      selectedSoundId: newSoundId,
    }));
    get().commit();
  },

  updateSound: (soundId, updates) => {
    set((state) => ({
      sounds: state.sounds.map((sound) =>
        sound.id === soundId ? { ...sound, ...updates } : sound
      ),
    }));
    get().commit();
  },

  removeSound: (soundId) => {
    set((state) => ({
      sounds: state.sounds.filter((sound) => sound.id !== soundId),
      selectedSoundId: state.selectedSoundId === soundId ? null : state.selectedSoundId,
    }));
    get().commit();
  },

  setSelectedSoundId: (soundId) => {
    set({ selectedSoundId: soundId });
  },
});
