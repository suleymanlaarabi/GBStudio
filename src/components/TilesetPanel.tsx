import React, { useRef, useEffect, useState } from "react";
import { useStore } from "../store/useStore";
import type { Tile, TileSize } from "../store/useStore";
import { Plus, Database, X, Check } from "lucide-react";

const GB_COLORS = ["#e0f8cf", "#8bac0f", "#306230", "#0f380f"];

const TilePreview: React.FC<{ tile: Tile }> = ({ tile }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gridSize = tile.size || 8;
    const pixelSize = canvas.width / gridSize;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    tile.data.forEach((row, y) => {
      row.forEach((colorIndex, x) => {
        ctx.fillStyle = GB_COLORS[colorIndex];
        ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      });
    });
  }, [tile]);

  return (
    <canvas
      ref={canvasRef}
      width={40}
      height={40}
      style={{ display: "block", imageRendering: "pixelated" }}
    />
  );
};

export const TilesetPanel: React.FC = () => {
  const {
    tilesets,
    activeTilesetIndex,
    setActiveTileset,
    addTileset,
    activeTileIndex,
    setActiveTile,
    addTile,
  } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSize, setNewSize] = useState<TileSize>(8);

  const activeTileset = tilesets[activeTilesetIndex];

  const handleCreate = () => {
    if (newName.trim()) {
      addTileset(newName.trim(), newSize);
      setIsCreating(false);
      setNewName("");
    }
  };

  return (
    <div
      className="card"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        minHeight: "400px",
      }}
    >
      <div className="section-title">
        Tileset Registry
        {!isCreating && (
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 8px" }}
            onClick={() => setIsCreating(true)}
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Creation UI */}
      {isCreating && (
        <div
          style={{
            background: "#151515",
            padding: "1rem",
            borderRadius: "8px",
            border: "1px solid var(--accent)",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <input
            autoFocus
            placeholder="Tileset Name..."
            className="btn btn-secondary"
            style={{
              textAlign: "left",
              cursor: "text",
              fontSize: "0.75rem",
            }}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className={`btn ${newSize === 8 ? "" : "btn-secondary"}`}
              style={{ flex: 1, fontSize: "0.75rem" }}
              onClick={() => setNewSize(8)}
            >
              8x8
            </button>
            <button
              className={`btn ${newSize === 16 ? "" : "btn-secondary"}`}
              style={{ flex: 1, fontSize: "0.75rem" }}
              onClick={() => setNewSize(16)}
            >
              16x16
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              className="btn"
              style={{ flex: 1, padding: "8px", background: "#22c55e" }}
              onClick={handleCreate}
            >
              <Check size={16} />
            </button>
            <button
              className="btn btn-secondary"
              style={{ flex: 1, padding: "8px" }}
              onClick={() => setIsCreating(false)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Tileset Selector */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "0.5rem",
          overflowX: "auto",
          paddingBottom: "0.5rem",
        }}
      >
        {tilesets.map((ts, idx) => (
          <button
            key={ts.id}
            className={`btn ${idx === activeTilesetIndex ? "" : "btn-secondary"}`}
            style={{
              whiteSpace: "nowrap",
              fontSize: "0.75rem",
              padding: "6px 12px",
              border:
                idx === activeTilesetIndex ? "1px solid var(--accent)" : "",
            }}
            onClick={() => setActiveTileset(idx)}
          >
            <Database size={12} style={{ marginRight: "4px" }} />
            {ts.name} ({ts.tileSize}x{ts.tileSize})
          </button>
        ))}
      </div>

      {activeTileset ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid #333",
              paddingTop: "1rem",
            }}
          >
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: "bold",
                color: "var(--accent)",
              }}
            >
              {activeTileset.name} ({activeTileset.tiles.length})
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: "4px 10px", fontSize: "0.75rem" }}
              onClick={() => addTile(activeTilesetIndex)}
            >
              <Plus size={14} style={{ marginRight: "4px" }} /> Add Tile
            </button>
          </div>

          <div
            className="tileset-grid"
            style={{
              gridTemplateColumns: `repeat(${activeTileset.tileSize === 8 ? 4 : 3}, 1fr)`,
            }}
          >
            {activeTileset.tiles.map((tile, index) => (
              <div
                key={tile.id}
                className={`tileset-item ${index === activeTileIndex ? "active" : ""}`}
                style={{
                  width: "100%",
                  height: "auto",
                  aspectRatio: "1",
                  border:
                    index === activeTileIndex
                      ? "2px solid var(--accent)"
                      : "1px solid #333",
                }}
                onClick={() => setActiveTile(index)}
                title={`Tile #${index}`}
              >
                <TilePreview tile={tile} />
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", color: "#444", marginTop: "2rem" }}>
          No tileset selected
        </div>
      )}

      <div
        style={{
          marginTop: "auto",
          fontSize: "0.7rem",
          color: "#555",
          borderTop: "1px solid #222",
          paddingTop: "0.5rem",
        }}
      >
        Total Assets: {tilesets.reduce((acc, ts) => acc + ts.tiles.length, 0)}
      </div>
    </div>
  );
};
