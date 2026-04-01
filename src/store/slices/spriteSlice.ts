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
  SpriteSlice
> = (set, get) => ({
  sprites: [],
  selectedSpriteId: null,
  selectedAnimId: null,

  addSprite: (name) => {
    const newSpriteId = crypto.randomUUID();
    set((state) => ({
      sprites: [
        ...state.sprites,
        { id: newSpriteId, name, animations: [] },
      ],
      selectedSpriteId: newSpriteId,
    }));
    get().commit();
  },

  setSelectedSpriteId: (spriteId) => {
    set({ selectedSpriteId: spriteId });
  },

  setSelectedAnimId: (animId) => {
    set({ selectedAnimId: animId });
  },

  addAnimation: (spriteId, name) => {
    set((state) => ({
      sprites: state.sprites.map((sprite) =>
        sprite.id === spriteId
          ? {
              ...sprite,
              animations: [
                ...sprite.animations,
                {
                  id: crypto.randomUUID(),
                  name,
                  frames: [],
                  loop: true,
                },
              ],
            }
          : sprite,
      ),
    }));
    get().commit();
  },

  addFrame: (spriteId, animationId, tileIndex, tilesetId) => {
    set((state) => ({
      sprites: state.sprites.map((sprite) =>
        sprite.id === spriteId
          ? {
              ...sprite,
              animations: sprite.animations.map((animation) =>
                animation.id === animationId
                  ? {
                      ...animation,
                      frames: [...animation.frames, { tileIndex, tilesetId, duration: 8 }],
                    }
                  : animation,
              ),
            }
          : sprite,
      ),
    }));
    get().commit();
  },

  updateFrameDuration: (spriteId, animationId, frameIndex, duration) => {
    set((state) => ({
      sprites: state.sprites.map((sprite) =>
        sprite.id === spriteId
          ? {
              ...sprite,
              animations: sprite.animations.map((animation) =>
                animation.id === animationId
                  ? {
                      ...animation,
                      frames: animation.frames.map((frame, currentIndex) =>
                        currentIndex === frameIndex ? { ...frame, duration } : frame,
                      ),
                    }
                  : animation,
              ),
            }
          : sprite,
