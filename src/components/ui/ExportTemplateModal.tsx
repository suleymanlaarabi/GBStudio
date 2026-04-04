import React, { useState } from "react";
import { X, Download, Package } from "lucide-react";
import {
import type { TileMap, Tileset, SpriteAsset, SoundAsset } from "../../types";
import type { TemplateCategory } from "../../types/template";
  buildTemplateFromSelection,
  exportTemplateAsFile,
  saveUserTemplate,
} from "../../services/templateService";

interface ExportTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  maps: TileMap[];
  tilesets: Tileset[];
  sprites: SpriteAsset[];
  sounds?: SoundAsset[];
}

export const ExportTemplateModal: React.FC<ExportTemplateModalProps> = ({
  isOpen,
  onClose,
  maps,
  tilesets,
  sprites,
  sounds = [],
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
          Object.values(layer.chunks).forEach((chunk) =>
            chunk.data.forEach((row) =>
              row.forEach((cell) => { if (cell) ids.add(cell.tilesetId); })
            )
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
      sprites,
      sounds,
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
