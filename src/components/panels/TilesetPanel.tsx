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
