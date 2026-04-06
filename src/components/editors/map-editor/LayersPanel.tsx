import React, { useState } from "react";
import { Eye, EyeOff, Plus, Trash2, ChevronUp, ChevronDown, Copy, Pencil, Monitor } from "lucide-react";
import { useStore } from "../../../store";
import type { MapLayer } from "../../../types";

interface LayerRowProps {
  layer: MapLayer;
  layerIndex: number;
  mapIndex: number;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  canDelete: boolean;
  onSelect: () => void;
}

const LayerRow: React.FC<LayerRowProps> = ({
  layer,
  layerIndex,
  mapIndex,
  isActive,
  isFirst,
  isLast,
  canDelete,
  onSelect,
}) => {
  const {
    toggleLayerVisibility,
    removeLayer,
    moveLayerUp,
    moveLayerDown,
    duplicateLayer,
    renameLayer,
  } = useStore();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(layer.name);

  const commitRename = () => {
    if (draft.trim()) renameLayer(mapIndex, layerIndex, draft.trim());
    else setDraft(layer.name);
    setEditing(false);
  };

  return (
    <div
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "6px 8px",
        background: isActive ? "#1a1a2e" : "transparent",
        border: `1px solid ${isActive ? "var(--accent)" : "transparent"}`,
        borderRadius: "7px",
        cursor: "pointer",
        transition: "all 0.1s",
        userSelect: "none",
      }}
    >
      {/* Visibility toggle */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(mapIndex, layerIndex); }}
        style={{ background: "none", border: "none", cursor: "pointer", color: layer.visible ? "var(--accent)" : "#444", padding: 0, display: "flex" }}
        title={layer.visible ? "Hide layer" : "Show layer"}
      >
        {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>

      {/* Name / edit */}
      {editing ? (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") { setDraft(layer.name); setEditing(false); }
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            background: "#0d0d0d",
            border: "1px solid var(--accent)",
            borderRadius: "4px",
            color: "#fff",
            padding: "2px 5px",
            fontSize: "0.8rem",
          }}
        />
      ) : (
        <span
          style={{ flex: 1, fontSize: "0.82rem", color: isActive ? "#fff" : "#aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
