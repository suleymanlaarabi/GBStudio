import React from "react";
import { Copy, Trash2 } from "lucide-react";
import type { MapTool, MapSelectionState, MapClipboard } from "../../../types";
import { TOOL_OPTIONS } from "./constants";
import type { CellCoords } from "./types";

interface MapToolBarProps {
  mapTool: MapTool;
  setMapTool: (tool: MapTool) => void;
  mapShapeFilled: boolean;
  setMapShapeFilled: (filled: boolean) => void;
  mapSelection: MapSelectionState;
  mapClipboard: MapClipboard | null;
  copyMapSelection: () => void;
  cutMapSelection: () => void;
  pasteMapSelection: (x: number, y: number) => void;
  deleteMapSelection: () => void;
  clearMapSelection: () => void;
  hoverCell: CellCoords | null;
}

export const MapToolBar: React.FC<MapToolBarProps> = ({
  mapTool,
  setMapTool,
  mapShapeFilled,
  setMapShapeFilled,
  mapSelection,
  mapClipboard,
  copyMapSelection,
  cutMapSelection,
  pasteMapSelection,
  deleteMapSelection,
  clearMapSelection,
  hoverCell,
}) => {
  return (
    <div
      className="card"
      style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
    >
      <div className="section-title" style={{ fontSize: "0.9rem" }}>
        Map Tools
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {TOOL_OPTIONS.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`btn ${mapTool === id ? "" : "btn-secondary"}`}
            onClick={() => setMapTool(id)}
            title={label}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <button
          className={`btn ${mapShapeFilled ? "" : "btn-secondary"}`}
          onClick={() => setMapShapeFilled(true)}
          title="Draw filled shapes"
        >
          Filled
        </button>
        <button
          className={`btn ${!mapShapeFilled ? "" : "btn-secondary"}`}
          onClick={() => setMapShapeFilled(false)}
          title="Draw outline shapes"
        >
          Outline
        </button>
        <button
          className="btn btn-secondary"
          onClick={copyMapSelection}
          disabled={!mapSelection.hasSelection}
          title="Copy selection"
        >
          <Copy size={14} />
        </button>
        <button
          className="btn btn-secondary"
          onClick={cutMapSelection}
          disabled={!mapSelection.hasSelection}
          title="Cut selection"
        >
          Cut
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (hoverCell) pasteMapSelection(hoverCell.x, hoverCell.y);
            else if (mapSelection.hasSelection)
              pasteMapSelection(mapSelection.x, mapSelection.y);
          }}
          disabled={!mapClipboard}
          title="Paste selection"
        >
          Paste
        </button>
        <button
          className="btn btn-secondary"
          onClick={deleteMapSelection}
          disabled={!mapSelection.hasSelection}
          title="Delete selection"
        >
          <Trash2 size={14} />
        </button>
        <button
          className="btn btn-secondary"
          onClick={clearMapSelection}
          disabled={!mapSelection.hasSelection}
          title="Clear current selection"
        >
          Clear Sel
        </button>
      </div>
    </div>
  );
};
