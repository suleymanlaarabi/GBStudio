import React, { useState } from "react";
import { Database, MousePointer, Crop } from "lucide-react";
import type { Tileset, MapTool, MapSelectionState } from "../../../types";
import { CustomSelect } from "../../ui/CustomSelect";
import { TilesetGrid } from "./TilesetGrid";
import { useStore } from "../../../store";
import { getTileAtTilesetPosition } from "../../../services/tileService";

interface MapAssetPanelProps {
  tilesets: Tileset[];
  activeTilesetIndex: number;
  setActiveTileset: (index: number) => void;
  activeTileIndex: number;
  setActiveTile: (index: number) => void;
  tileSize: number;
  mapTool: MapTool;
  mapSelection: MapSelectionState;
}

type SelectionMode = "single" | "multiple";

export const MapAssetPanel: React.FC<MapAssetPanelProps> = ({
  tilesets,
  activeTilesetIndex,
  setActiveTileset,
  activeTileIndex,
  setActiveTile,
  tileSize,
  mapTool,
  mapSelection,
}) => {
  const activeTileset = tilesets[activeTilesetIndex];
  const { tileSelection, beginTileSelection, updateTileSelection, endTileSelection, clearTileSelection } = useStore();
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("single");

  const handleTileSelect = (tileIndex: number) => {
    clearTileSelection();
    setActiveTile(tileIndex);
  };

  const handleTileSelectionStart = (x: number, y: number) => {
    if (selectionMode === "single") {
      const gridTile = activeTileset
        ? getTileAtTilesetPosition(activeTileset, x, y)
        : null;
      if (gridTile) {
        handleTileSelect(gridTile.tileIndex);
      }
    } else {
      beginTileSelection(x, y);
    }
  };

  const handleTileSelectionUpdate = (x: number, y: number) => {
    if (selectionMode === "multiple") {
      updateTileSelection(x, y);
    }
  };

  const handleTileSelectionEnd = () => {
    endTileSelection();
  };

  return (
    <div
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        overflow: "hidden",
      }}
    >
      <div className="section-title" style={{ fontSize: "0.9rem" }}>
        <Database size={16} /> Asset Library
      </div>

      <CustomSelect
        value={activeTilesetIndex}
        onChange={(value) => {
          setActiveTileset(Number(value));
          clearTileSelection();
        }}
        options={tilesets.map((ts, i) => ({
          value: i,
          label: `${ts.name} (${ts.tileSize}x${ts.tileSize})${ts.tileSize !== tileSize ? " (Incompatible)" : ""}`,
          disabled: ts.tileSize !== tileSize,
        }))}
      />

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.75rem",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => {
              setSelectionMode("single");
              clearTileSelection();
            }}
            className={`btn ${selectionMode === "single" ? "" : "btn-secondary"}`}
            style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <MousePointer size={14} /> Single
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectionMode("multiple");
              clearTileSelection();
            }}
            className={`btn ${selectionMode === "multiple" ? "" : "btn-secondary"}`}
            style={{ padding: "4px 8px", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <Crop size={14} /> Multi
          </button>
        </div>

        {selectionMode === "multiple" && tileSelection.hasSelection && tileSelection.width > 0 && (
          <div style={{ color: "#999" }}>
            {tileSelection.width}x{tileSelection.height} tiles
          </div>
        )}
      </div>

      <div style={{ fontSize: "0.75rem", color: "#999" }}>
        Active tool: <strong style={{ color: "#fff" }}>{mapTool}</strong>
        {mapSelection.hasSelection &&
          ` • Selection ${mapSelection.width}x${mapSelection.height}`}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {activeTileset ? (
          <TilesetGrid
            tileset={activeTileset}
            tileSize={tileSize}
            selectedTileIndex={activeTileIndex}
            showSingleSelection={selectionMode === "single"}
            onTileSelectionStart={handleTileSelectionStart}
            onTileSelectionUpdate={handleTileSelectionUpdate}
            onTileSelectionEnd={handleTileSelectionEnd}
          />
        ) : (
          <div style={{ textAlign: "center", color: "#444", marginTop: "2rem" }}>
            No tileset selected
          </div>
        )}
      </div>
    </div>
  );
};
