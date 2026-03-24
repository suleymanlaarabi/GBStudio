import type { SpriteAsset, SoundAsset, SoundChannelType } from "../../types";
import type { MapExport, RomAllocationPlan } from "./types";
import { sanitizeName } from "./utils";

const CHANNEL_NUM: Record<SoundChannelType, number> = {
  PULSE1: 1, PULSE2: 2, WAVE: 3, NOISE: 4,
};

const CHANNEL_LABEL: Record<SoundChannelType, string> = {
  PULSE1: "GBT_CH_PULSE1", PULSE2: "GBT_CH_PULSE2",
  WAVE:   "GBT_CH_WAVE",   NOISE:  "GBT_CH_NOISE",
};

export const buildHeader = (
  projectName: string,
  mapExports: MapExport[],
  sprites: SpriteAsset[],
  romPlan: RomAllocationPlan,
  sounds: SoundAsset[],
): string => {
