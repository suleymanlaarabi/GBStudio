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
      ),
    }));
    get().commit();
  },

  removeFrame: (spriteId, animationId, frameIndex) => {
    set((state) => ({
      sprites: state.sprites.map((sprite) =>
        sprite.id === spriteId
          ? {
              ...sprite,
              animations: sprite.animations.map((animation) =>
                animation.id === animationId
                  ? {
                      ...animation,
                      frames: animation.frames.filter(
                        (_, currentIndex) => currentIndex !== frameIndex,
                      ),
                    }
                  : animation,
              ),
            }
          : sprite,
      ),
    }));
    get().commit();
  },

  removeAnimation: (spriteId, animationId) => {
    set((state) => ({
      sprites: state.sprites.map((sprite) =>
        sprite.id === spriteId
          ? {
              ...sprite,
              animations: sprite.animations.filter((animation) => animation.id !== animationId),
            }
          : sprite,
      ),
    }));
    get().commit();
  },

  removeSprite: (spriteId) => {
    set((state) => {
      // Vérifier si le sprite supprimé est le sprite sélectionné
      const isSelectedSprite = state.selectedSpriteId === spriteId;
      const nextSelectedSprite = isSelectedSprite ? null : state.selectedSpriteId;

      // Vérifier si le sprite supprimé contient l'animation sélectionnée
      const spriteToDelete = state.sprites.find((sprite) => sprite.id === spriteId);
      const hasSelectedAnim = spriteToDelete?.animations.some((animation) => animation.id === state.selectedAnimId) ?? false;
      const nextSelectedAnim = hasSelectedAnim ? null : state.selectedAnimId;

      return {
        sprites: state.sprites.filter((sprite) => sprite.id !== spriteId),
        selectedSpriteId: nextSelectedSprite,
        selectedAnimId: nextSelectedAnim,
      };
    });
    get().commit();
  },
});
