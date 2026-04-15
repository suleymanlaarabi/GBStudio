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
          onClick={onAddSprite}
        >
          <Plus size={16} />
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {sprites.map((s) => (
          <div key={s.id} style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
            <button
              className={`btn ${selectedSpriteId === s.id ? "" : "btn-secondary"}`}
              style={{ flex: 1, justifyContent: "flex-start", fontSize: "0.8rem", padding: "8px 12px" }}
              onClick={() => onSelectSprite(s.id)}
            >
              <Film size={14} style={{ marginRight: "8px" }} /> {s.name}
            </button>
            {selectedSpriteId === s.id && (
              <>
                {confirmDeleteId === s.id ? (
                  <>
                    <button
                      className="btn btn-danger"
                      style={{ padding: "8px" }}
                      onClick={() => handleRemoveClick(s.id)}
                      title="Confirmer la suppression"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "8px" }}
                      onClick={() => setConfirmDeleteId(null)}
                      title="Annuler"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-danger"
                    style={{ padding: "8px" }}
                    onClick={() => handleRemoveClick(s.id)}
                    title="Supprimer le sprite"
                  >
                    <Trash size={14} />
                  </button>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
