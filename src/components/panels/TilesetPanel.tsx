import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, Database, Plus, Trash2, X } from "lucide-react";
import { GB_COLORS } from "../../constants/colors";
import { useStore } from "../../store";
import type { Tile, TileSize } from "../../types";
import { getTilesetPositionForTile, normalizeTilesetLayout } from "../../services/tileService";

const TILE_SLOT_SIZE = 60;
const TILE_GRID_GAP = 6;
const TILE_GRID_PADDING = 6;

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
        if (colorIndex === null || colorIndex === undefined) return;
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
    moveTileInGrid,
    maps,
  } = useStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSize, setNewSize] = useState<TileSize>(8);
  const [dragState, setDragState] = useState<{
    tileId: string;
    pointerId: number;
    originX: number;
    originY: number;
    hoverSlot: { x: number; y: number } | null;
    moved: boolean;
  } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const activeTileset = tilesets[activeTilesetIndex];
  const normalizedActiveTileset = useMemo(
    () => (activeTileset ? normalizeTilesetLayout(activeTileset) : undefined),
    [activeTileset],
  );
  const gridColumns = normalizedActiveTileset?.layout?.columns ?? (normalizedActiveTileset?.tileSize === 8 ? 4 : 3);
  const gridRows = useMemo(() => {
    const positions = Object.values(normalizedActiveTileset?.layout?.positions ?? {});
    const maxRow = positions.reduce((highest, position) => Math.max(highest, position.y), 0);
    return Math.max(2, maxRow + 2);
  }, [normalizedActiveTileset]);
  const gridSlots = useMemo(
    () =>
      Array.from({ length: gridColumns * gridRows }, (_, slotIndex) => ({
        x: slotIndex % gridColumns,
        y: Math.floor(slotIndex / gridColumns),
      })),
    [gridColumns, gridRows],
  );

  const handleCreate = () => {
    if (!newName.trim()) return;
    addTileset(newName.trim(), newSize);
    setIsCreating(false);
    setNewName("");
  };

  const getTilesetUsageCount = (tilesetId: string) => {
    return maps.filter((map) =>
      map.layers.some((layer) =>
        Object.values(layer.chunks).some((chunk) =>
          chunk.data.some((row) =>
            row.some((cell) => cell && cell.tilesetId === tilesetId),
          ),
        ),
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
      map.layers.some((layer) =>
        Object.values(layer.chunks).some((chunk) =>
          chunk.data.some((row) =>
            row.some(
              (cell) =>
                cell &&
                cell.tileIndex === tileIndex &&
                cell.tilesetId === activeTileset.id,
            ),
          ),
        ),
      ),
    );
  };

  const handleDeleteTile = (tileIndex: number) => {
    if (!normalizedActiveTileset) return;

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
    if (activeTileIndex >= normalizedActiveTileset.tiles.length - 1) {
      setActiveTile(Math.max(0, activeTileIndex - 1));
    }
  };

  const getSlotFromPointer = (clientX: number, clientY: number) => {
    const grid = gridRef.current;
    if (!grid) return null;

    const rect = grid.getBoundingClientRect();
    const relativeX = clientX - rect.left + grid.scrollLeft - TILE_GRID_PADDING;
    const relativeY = clientY - rect.top + grid.scrollTop - TILE_GRID_PADDING;

    if (relativeX < 0 || relativeY < 0) return null;

    const slotPitch = TILE_SLOT_SIZE + TILE_GRID_GAP;
    const x = Math.floor(relativeX / slotPitch);
    const y = Math.floor(relativeY / slotPitch);

    if (x < 0 || x >= gridColumns || y < 0 || y >= gridRows) return null;

    return { x, y };
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
