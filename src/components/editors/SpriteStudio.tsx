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
    setSpriteModalOpen,
    animModalOpen,
    setAnimModalOpen,
    tiles,
    activeSprite,
    activeAnim,
  } = useSpriteStudio();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr 300px",
        gap: "1rem",
        height: "calc(100% - 1rem)",
        minHeight: 0,
      }}
    >
      <SpriteSidebar
        sprites={sprites}
        selectedSpriteId={selectedSpriteId}
        onSelectSprite={setSelectedSpriteId}
        onAddSprite={() => setSpriteModalOpen(true)}
        onRemoveSprite={removeSprite}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          overflow: "hidden",
        }}
      >
        <AnimationList
          activeSpriteName={activeSprite?.name}
          animations={activeSprite?.animations}
          tilesets={tilesets}
          selectedAnimId={selectedAnimId}
          onSelectAnim={setSelectedAnimId}
