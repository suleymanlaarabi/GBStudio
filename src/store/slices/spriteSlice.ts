import type { StateCreator } from "zustand";
import type { SpriteAsset } from "../../types";

export interface SpriteSlice {
  sprites: SpriteAsset[];
  selectedSpriteId: string | null;
  selectedAnimId: string | null;
  addSprite: (name: string) => void;
  addAnimation: (spriteId: string, name: string) => void;
  addFrame: (spriteId: string, animationId: string, tileIndex: number, tilesetId: string) => void;
  updateFrameDuration: (
    spriteId: string,
    animationId: string,
    frameIndex: number,
    duration: number,
  ) => void;
  removeFrame: (spriteId: string, animationId: string, frameIndex: number) => void;
  removeAnimation: (spriteId: string, animationId: string) => void;
  removeSprite: (spriteId: string) => void;
  setSelectedSpriteId: (spriteId: string | null) => void;
  setSelectedAnimId: (animId: string | null) => void;
}

type SpriteState = SpriteSlice & {
  commit: () => void;
};

export const createSpriteSlice: StateCreator<
  SpriteState,
  [],
  [],
