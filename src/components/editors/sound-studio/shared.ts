import { Wind, Waves, Zap, type LucideIcon } from "lucide-react";
import type { SoundAsset, SoundChannelType } from "../../../types";

export const SOUND_TYPE_BUTTONS: Array<{
  label: string;
  title: string;
  type: SoundChannelType;
}> = [
  { label: "P1", title: "Add Pulse 1 SFX", type: "PULSE1" },
  { label: "P2", title: "Add Pulse 2 SFX", type: "PULSE2" },
  { label: "WAVE", title: "Add Wave SFX", type: "WAVE" },
  { label: "NOISE", title: "Add Noise SFX", type: "NOISE" },
];

export const getSoundIcon = (type: SoundChannelType): LucideIcon => {
  if (type === "PULSE1" || type === "PULSE2") {
    return Zap;
  }

  return type === "WAVE" ? Waves : Wind;
};

export const getSoundButtonContent = (type: SoundChannelType) => {
  if (type === "PULSE1") {
    return { kind: "label" as const, value: "P1" };
  }

  if (type === "PULSE2") {
    return { kind: "label" as const, value: "P2" };
  }

  return { kind: "icon" as const, value: getSoundIcon(type) };
};

export const getSelectedSound = (
  sounds: SoundAsset[],
  selectedSoundId: string | null,
) => sounds.find((sound) => sound.id === selectedSoundId);
