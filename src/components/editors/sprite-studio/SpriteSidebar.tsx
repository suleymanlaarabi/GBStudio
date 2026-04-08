import React, { useState } from "react";
import { Plus, Film, Trash, Check, X } from "lucide-react";
import type { SpriteAsset } from "../../../types";

interface SpriteSidebarProps {
  sprites: SpriteAsset[];
  selectedSpriteId: string | null;
  onSelectSprite: (id: string) => void;
  onAddSprite: () => void;
  onRemoveSprite: (id: string) => void;
}

export const SpriteSidebar: React.FC<SpriteSidebarProps> = ({
  sprites,
  selectedSpriteId,
  onSelectSprite,
  onAddSprite,
  onRemoveSprite,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleRemoveClick = (spriteId: string) => {
    if (confirmDeleteId === spriteId) {
      onRemoveSprite(spriteId);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(spriteId);
    }
  };

  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="section-title">
        Sprites
        <button
          className="btn btn-secondary"
          style={{ padding: "4px" }}
