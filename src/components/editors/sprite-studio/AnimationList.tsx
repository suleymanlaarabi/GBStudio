import React from "react";
import { Plus, X } from "lucide-react";
import { useStore } from "../../../store";
import type { SpriteAnimation, Tileset } from "../../../types";
import { AnimationPreview } from "./AnimationPreview";

interface AnimationListProps {
  activeSpriteName: string | undefined;
  animations: SpriteAnimation[] | undefined;
  tilesets: Tileset[];
  selectedAnimId: string | null;
  onSelectAnim: (id: string) => void;
  onAddAnim: () => void;
}

export const AnimationList: React.FC<AnimationListProps> = ({
  activeSpriteName,
  animations,
  tilesets,
  selectedAnimId,
  onSelectAnim,
  onAddAnim,
}) => {
  const { removeAnimation, selectedSpriteId } = useStore();

  return (
    <div className="card" style={{ flexShrink: 0 }}>
      <div className="section-title">
        {activeSpriteName ? `${activeSpriteName} Animations` : "Animations"}
        {activeSpriteName && (
          <button
            className="btn btn-secondary"
            style={{ padding: "4px" }}
            onClick={onAddAnim}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
        }}
      >
        {animations?.map((a) => (
          <div
            key={a.id}
            className={`card ${selectedAnimId === a.id ? "active" : ""}`}
            style={{
              minWidth: "184px",
              cursor: "pointer",
              padding: "0.5rem",
              border:
                selectedAnimId === a.id
                  ? "2px solid var(--accent)"
                  : "1px solid #333",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            onClick={() => onSelectAnim(a.id)}
          >
            <div
              style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
            >
              <AnimationPreview anim={a} tilesets={tilesets} />
              <div style={{ fontWeight: "bold", fontSize: "0.85rem" }}>
                {a.name}
              </div>
            </div>
            {selectedSpriteId && (
              <button
                className="btn btn-secondary"
                style={{ padding: "2px", marginLeft: "auto" }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedSpriteId) {
                    removeAnimation(selectedSpriteId, a.id);
                  }
                }}
                aria-label={`Supprimer l'animation ${a.name}`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
