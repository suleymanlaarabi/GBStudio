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
