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
