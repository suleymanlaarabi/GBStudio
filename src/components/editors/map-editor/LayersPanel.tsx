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
