import { useState } from "react";
import { useStore } from "../../../store";

export const useSpriteStudio = () => {
  const {
    sprites,
    tilesets,
    activeTilesetIndex,
    setActiveTileset,
    addSprite,
    addAnimation,
    addFrame,
    updateFrameDuration,
    removeFrame,
    removeAnimation,
    removeSprite,
    activeTileIndex,
    setActiveTile,
    selectedSpriteId,
    setSelectedSpriteId,
    selectedAnimId,
    setSelectedAnimId,
  } = useStore();

  const [spriteModalOpen, setSpriteModalOpen] = useState(false);
  const [animModalOpen, setAnimModalOpen] = useState(false);

  const activeTileset = tilesets[activeTilesetIndex];
  const tiles = activeTileset?.tiles || [];
  const activeSprite = sprites.find((s) => s.id === selectedSpriteId);
  const activeAnim = activeSprite?.animations.find((a) => a.id === selectedAnimId);

  return {
    sprites,
    tilesets,
    activeTilesetIndex,
    setActiveTileset,
    addSprite,
    addAnimation,
    addFrame,
    updateFrameDuration,
    removeFrame,
    removeAnimation,
    removeSprite,
    activeTileIndex,
    setActiveTile,
    selectedSpriteId,
    setSelectedSpriteId,
    selectedAnimId,
    setSelectedAnimId,
    spriteModalOpen,
    setSpriteModalOpen,
    animModalOpen,
    setAnimModalOpen,
    activeTileset,
    tiles,
    activeSprite,
    activeAnim,
  };
};
