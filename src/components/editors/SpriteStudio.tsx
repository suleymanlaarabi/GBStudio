import React from "react";
import { Modal } from "../ui/Modal";
import { useSpriteStudio } from "./sprite-studio/useSpriteStudio";
import { SpriteSidebar } from "./sprite-studio/SpriteSidebar";
import { AnimationList } from "./sprite-studio/AnimationList";
import { Timeline } from "./sprite-studio/Timeline";
import { SpriteAssetLibrary } from "./sprite-studio/SpriteAssetLibrary";

export const SpriteStudio: React.FC = () => {
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
    removeSprite,
    activeTileIndex,
    setActiveTile,
    selectedSpriteId,
    setSelectedSpriteId,
    selectedAnimId,
    setSelectedAnimId,
    spriteModalOpen,
