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
