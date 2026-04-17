import React, { useState } from "react";
import { Eye, EyeOff, Plus, Trash2, ChevronUp, ChevronDown, Copy, Pencil } from "lucide-react";
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
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); setDraft(layer.name); }}
          title="Double-click to rename"
        >
          {layer.name}
        </span>
      )}

      {/* Actions (visible on hover / active) */}
      {isActive && !editing && (
        <div style={{ display: "flex", gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => { setEditing(true); setDraft(layer.name); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: 2, display: "flex" }}
            title="Rename"
          >
            <Pencil size={11} />
          </button>
          <button
            onClick={() => duplicateLayer(mapIndex, layerIndex)}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#666", padding: 2, display: "flex" }}
            title="Duplicate"
          >
            <Copy size={11} />
          </button>
          <button
            onClick={() => moveLayerDown(mapIndex, layerIndex)}
            disabled={isFirst}
            style={{ background: "none", border: "none", cursor: isFirst ? "default" : "pointer", color: isFirst ? "#333" : "#666", padding: 2, display: "flex" }}
            title="Move down"
          >
            <ChevronDown size={11} />
          </button>
          <button
            onClick={() => moveLayerUp(mapIndex, layerIndex)}
            disabled={isLast}
            style={{ background: "none", border: "none", cursor: isLast ? "default" : "pointer", color: isLast ? "#333" : "#666", padding: 2, display: "flex" }}
            title="Move up"
          >
            <ChevronUp size={11} />
          </button>
          {canDelete && (
            <button
              onClick={() => removeLayer(mapIndex, layerIndex)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#ff4444", padding: 2, display: "flex" }}
              title="Delete"
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface LayersPanelProps {
  mapIndex: number;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ mapIndex }) => {
  const { maps, activeLayerIndex, setActiveLayer, addLayer } = useStore();
  const map = maps[mapIndex];

  if (!map) return null;

  // Display layers in reverse order (top layer first visually)
  const reversed = [...map.layers].reverse();

  return (
    <div
      className="card"
      style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: 180 }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={{ fontSize: "0.78rem", color: "#888", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Layers
        </span>
        <button
          className="btn btn-secondary"
          style={{ padding: "3px 7px", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 3 }}
          onClick={() => addLayer(mapIndex)}
          title="Add layer"
        >
          <Plus size={11} /> Add
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {reversed.map((layer) => {
          const realIndex = map.layers.indexOf(layer);
          return (
            <LayerRow
              key={layer.id}
              layer={layer}
              layerIndex={realIndex}
              mapIndex={mapIndex}
              isActive={realIndex === activeLayerIndex}
              isFirst={realIndex === 0}
              isLast={realIndex === map.layers.length - 1}
              canDelete={map.layers.length > 1}
              onSelect={() => setActiveLayer(realIndex)}
            />
          );
        })}
      </div>

      <div style={{ fontSize: "0.68rem", color: "#444", borderTop: "1px solid #1a1a1a", paddingTop: "0.5rem", marginTop: "0.25rem" }}>
        {map.layers.length} layer{map.layers.length > 1 ? "s" : ""} · active layer: <span style={{ color: "#666" }}>{map.layers[activeLayerIndex]?.name ?? "—"}</span>
      </div>
    </div>
  );
};
