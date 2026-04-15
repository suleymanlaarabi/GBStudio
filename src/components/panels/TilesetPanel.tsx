import React, { useEffect, useRef, useState } from "react";
import { Check, Database, Plus, Trash2, X } from "lucide-react";
import { GB_COLORS } from "../../constants/colors";
import { useStore } from "../../store";
import type { Tile, TileSize } from "../../types";

const TilePreview: React.FC<{ tile: Tile }> = ({ tile }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = tile.size || 8;
    // On utilise un multiple exact pour éviter les arrondis qui créent une grille
    const scale = Math.floor(canvas.width / size);
    const offset = (canvas.width - (size * scale)) / 2;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    tile.data.forEach((row, y) =>
      row.forEach((colorIndex, x) => {
        ctx.fillStyle = GB_COLORS[colorIndex];
        ctx.fillRect(
          Math.floor(offset + x * scale), 
          Math.floor(offset + y * scale), 
          scale, 
          scale
        );
      }),
    );
  }, [tile]);

  return (
    <canvas
      ref={canvasRef}
      width={50}
      height={50}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        imageRendering: "pixelated",
      }}
    />
  );
};

export const TilesetPanel: React.FC = () => {
  const {
    tilesets,
    activeTilesetIndex,
    setActiveTileset,
    addTileset,
    removeTileset,
    activeTileIndex,
    setActiveTile,
    addTile,
    removeTile,
    maps,
  } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSize, setNewSize] = useState<TileSize>(8);
  const activeTileset = tilesets[activeTilesetIndex];

  const handleCreate = () => {
    if (!newName.trim()) return;
    addTileset(newName.trim(), newSize);
    setIsCreating(false);
    setNewName("");
  };

  const getTilesetUsageCount = (tilesetId: string) => {
    return maps.filter((map) =>
      map.data.some((row) =>
        row.some((cell) => cell && cell.tilesetId === tilesetId),
      ),
    ).length;
  };

  const handleDeleteTileset = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const ts = tilesets[index];
    if (!ts) return;

    if (tilesets.length <= 1) {
      alert("Impossible de supprimer le dernier tileset.");
      return;
    }

    const usageCount = getTilesetUsageCount(ts.id);
    if (usageCount > 0) {
      const confirmMessage = `Ce tileset est utilisé dans ${usageCount} map(s).\n\nLa suppression effacera toutes les cellules qui l'utilisent.\n\nÊtes-vous sûr de vouloir supprimer le Tileset "${ts.name}" ?`;
      if (!confirm(confirmMessage)) return;
    } else {
      if (!confirm(`Supprimer le Tileset "${ts.name}" ?`)) return;
    }

    removeTileset(index);
  };

  const isTileUsedInMaps = (tileIndex: number) => {
    if (!activeTileset) return [];
    return maps.filter((map) =>
      map.data.some((row) =>
        row.some(
          (cell) =>
            cell &&
            cell.tileIndex === tileIndex &&
            cell.tilesetId === activeTileset.id,
        ),
      ),
    );
  };

  const handleDeleteTile = (tileIndex: number) => {
    if (!activeTileset) return;

    const usedMaps = isTileUsedInMaps(tileIndex);
    const isUsed = usedMaps.length > 0;

    if (isUsed) {
      const confirmMessage = `Cette tile est utilisée dans ${usedMaps.length} map(s).\n\nLa suppression va effacer toutes les cellules qui l'utilisent.\n\nÊtes-vous sûr de vouloir supprimer la Tile #${tileIndex} ?`;
      if (!confirm(confirmMessage)) return;
    } else {
      if (
        !confirm(`Êtes-vous sûr de vouloir supprimer la Tile #${tileIndex} ?`)
      )
        return;
    }

    removeTile(activeTilesetIndex, tileIndex);
    if (activeTileIndex >= activeTileset.tiles.length - 1) {
      setActiveTile(Math.max(0, activeTileIndex - 1));
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
            style={{ textAlign: "left", cursor: "text", fontSize: "0.75rem" }}
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

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
          paddingBottom: "4px",
        }}
      >
        {tilesets.map((ts, idx) => (
          <div
            key={ts.id}
            style={{ position: "relative", display: "flex", alignItems: "center" }}
          >
            <button
              className={`btn ${idx === activeTilesetIndex ? "" : "btn-secondary"}`}
              style={{
                whiteSpace: "nowrap",
                fontSize: "0.75rem",
                padding: "6px 24px 6px 10px",
                border:
                  idx === activeTilesetIndex ? "1px solid var(--accent)" : "",
              }}
              onClick={() => setActiveTileset(idx)}
            >
              <Database size={12} style={{ marginRight: "4px" }} />
              {ts.name} ({ts.tileSize}x{ts.tileSize})
            </button>
            <button
              onClick={(e) => handleDeleteTileset(idx, e)}
              style={{
                position: "absolute",
                right: "4px",
                background: "transparent",
                border: "none",
                color: idx === activeTilesetIndex ? "#fff" : "#666",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Supprimer ce tileset"
            >
              <Trash2 size={12} />
            </button>
          </div>
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
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <button
                className="btn btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                onClick={() => handleDeleteTile(activeTileIndex)}
                disabled={activeTileset.tiles.length <= 1}
                title="Delete the currently selected tile"
              >
                <Trash2 size={14} style={{ marginRight: "4px" }} /> Delete Tile
              </button>
              <button
                className="btn btn-secondary"
                style={{ padding: "4px 10px", fontSize: "0.75rem" }}
                onClick={() => addTile(activeTilesetIndex)}
                title="Add a new tile"
              >
                <Plus size={14} style={{ marginRight: "4px" }} /> Add Tile
              </button>
            </div>
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
                  width: "60px",
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
    </div>
  );
};
