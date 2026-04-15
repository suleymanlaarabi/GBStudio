import React from "react";
import { Database } from "lucide-react";
import type { Tileset, MapTool, MapSelectionState } from "../../../types";
import { CustomSelect } from "../../ui/CustomSelect";
import { GB_COLORS } from "../../../constants/colors";

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
        onChange={(value) => setActiveTileset(Number(value))}
        options={tilesets.map((ts, i) => ({
          value: i,
          label: `${ts.name} (${ts.tileSize}x${ts.tileSize})${ts.tileSize !== tileSize ? " (Incompatible)" : ""}`,
          disabled: ts.tileSize !== tileSize,
        }))}
      />

      <div style={{ fontSize: "0.75rem", color: "#999" }}>
        Active tool: <strong style={{ color: "#fff" }}>{mapTool}</strong>
        {mapSelection.hasSelection &&
          ` • Selection ${mapSelection.width}x${mapSelection.height}`}
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${activeTileset?.tileSize === 8 ? 4 : 2}, 1fr)`,
          }}
        >
          {activeTileset?.tiles.map((tile, i) => (
            <div
              key={tile.id}
              className={`tileset-item ${activeTileIndex === i ? "active" : ""}`}
              style={{
                height: "auto",
                aspectRatio: "1",
                border:
                  activeTileIndex === i
                    ? "2px solid var(--accent)"
                    : "1px solid #222",
              }}
              onClick={() => setActiveTile(i)}
            >
              <canvas
                width={32}
                height={32}
                ref={(el) => {
                  if (!el) return;
                  const ctx = el.getContext("2d");
                  if (!ctx) return;
                  const p = 32 / (activeTileset?.tileSize || 8);
                  tile.data.forEach((r, y) =>
                    r.forEach((c, x) => {
                      ctx.fillStyle = GB_COLORS[c];
                      ctx.fillRect(x * p, y * p, p, p);
                    }),
                  );
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
