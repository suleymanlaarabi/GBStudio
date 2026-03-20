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
