import React, { useState } from "react";
import { X, Download, Package } from "lucide-react";
import {
  buildTemplateFromSelection,
  exportTemplateAsFile,
  saveUserTemplate,
} from "../../services/templateService";
import type { TileMap, Tileset, SpriteAsset } from "../../types";
import type { TemplateCategory } from "../../types/template";

interface ExportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  maps: TileMap[];
  tilesets: Tileset[];
  sprites: SpriteAsset[];
}

export const ExportTemplateModal: React.FC<ExportTemplateModalProps> = ({
  isOpen,
  onClose,
  maps,
  tilesets,
  sprites,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TemplateCategory>("custom");
  const [selectedMapIds, setSelectedMapIds] = useState<Set<string>>(new Set());
  const [selectedSpriteIds, setSelectedSpriteIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleMap = (id: string) => {
    setSelectedMapIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSprite = (id: string) => {
    setSelectedSpriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getIncludedTilesets = (): Tileset[] => {
    const ids = new Set<string>();
    maps
      .filter((m) => selectedMapIds.has(m.id))
      .forEach((map) =>
        map.layers.forEach((layer) =>
          layer.data.forEach((row) =>
            row.forEach((cell) => { if (cell) ids.add(cell.tilesetId); })
          )
        )
      );
    sprites
      .filter((s) => selectedSpriteIds.has(s.id))
      .forEach((sprite) =>
        sprite.animations.forEach((anim) =>
          anim.frames.forEach((f) => ids.add(f.tilesetId))
        )
      );
    return tilesets.filter((ts) => ids.has(ts.id));
  };

  const canExport = name.trim() && selectedMapIds.size > 0;
  const includedTilesets = getIncludedTilesets();

  const handleExport = () => {
    if (!canExport) return;
    const template = buildTemplateFromSelection(
      name.trim(),
      description.trim(),
      category,
      [...selectedMapIds],
      [...selectedSpriteIds],
      maps,
      tilesets,
      sprites
    );
    saveUserTemplate(template);
    exportTemplateAsFile(template);
    onClose();
    setName("");
    setDescription("");
    setSelectedMapIds(new Set());
    setSelectedSpriteIds(new Set());
  };

  const inputStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid #333",
    borderRadius: "7px",
    padding: "8px 10px",
    color: "#fff",
    fontSize: "0.85rem",
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.75rem",
    color: "#888",
    marginBottom: 4,
    display: "block",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 560, width: "90%", display: "flex", flexDirection: "column", gap: "1.1rem" }}
      >
        {/* Header */}
        <div className="section-title">
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Package size={16} />
            Export as template
          </span>
          <button className="btn btn-secondary" style={{ padding: "4px 10px" }} onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        {/* Name + category */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: "0.75rem" }}>
          <div>
            <label style={labelStyle}>Template name *</label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My awesome template"
            />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select
              style={{ ...inputStyle, appearance: "none" }}
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
            >
              <option value="dungeon">Dungeon</option>
              <option value="overworld">Overworld</option>
              <option value="platformer">Platformer</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your template..."
          />
        </div>

        {/* Maps */}
        <div>
          <label style={{ ...labelStyle, marginBottom: 8 }}>
            Maps to include * ({selectedMapIds.size} selected)
          </label>
          {maps.length === 0 ? (
            <p style={{ color: "#555", fontSize: "0.8rem", margin: 0 }}>No maps in the project</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
              {maps.map((map) => (
                <label
                  key={map.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "8px 10px",
                    background: selectedMapIds.has(map.id) ? "#1a1a2e" : "#111",
                    border: `1px solid ${selectedMapIds.has(map.id) ? "var(--accent)" : "#222"}`,
                    borderRadius: "7px",
                    cursor: "pointer",
                    transition: "all 0.1s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedMapIds.has(map.id)}
                    onChange={() => toggleMap(map.id)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <span style={{ fontSize: "0.85rem", flex: 1 }}>{map.name}</span>
                  <span style={{ fontSize: "0.72rem", color: "#555" }}>
                    {map.width}×{map.height}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Tilesets auto-included */}
        {includedTilesets.length > 0 && (
          <div
            style={{
              background: "#0d1a0d",
              border: "1px solid #1a3a1a",
              borderRadius: "7px",
              padding: "10px 12px",
              fontSize: "0.78rem",
              color: "#4ade80",
            }}
          >
            <strong>Automatically included tilesets:</strong>{" "}
            {includedTilesets.map((ts) => ts.name).join(", ")}
          </div>
        )}

        {/* Sprites */}
        {sprites.length > 0 && (
          <div>
            <label style={{ ...labelStyle, marginBottom: 8 }}>
              Sprites to include (optional)
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 120, overflowY: "auto" }}>
              {sprites.map((sprite) => (
                <label
                  key={sprite.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "8px 10px",
                    background: selectedSpriteIds.has(sprite.id) ? "#1a1a2e" : "#111",
                    border: `1px solid ${selectedSpriteIds.has(sprite.id) ? "var(--accent)" : "#222"}`,
                    borderRadius: "7px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedSpriteIds.has(sprite.id)}
                    onChange={() => toggleSprite(sprite.id)}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <span style={{ fontSize: "0.85rem" }}>{sprite.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", paddingTop: "0.25rem" }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn"
            disabled={!canExport}
            onClick={handleExport}
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", opacity: canExport ? 1 : 0.4 }}
          >
            <Download size={15} />
            Export template
          </button>
        </div>
      </div>
    </div>
  );
};
