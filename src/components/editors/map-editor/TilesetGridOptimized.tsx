import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { GB_COLORS } from "../../../constants/colors";
import type { Tileset } from "../../../types";

interface TilesetGridProps {
  tileset: Tileset;
  tileSize: number;
  onTileSelectionStart: (x: number, y: number) => void;
  onTileSelectionUpdate: (x: number, y: number) => void;
  onTileSelectionEnd: () => void;
}

interface SelectionPreview {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const TilesetGridOptimized: React.FC<TilesetGridProps> = ({
  tileset,
  tileSize,
  onTileSelectionStart,
  onTileSelectionUpdate,
  onTileSelectionEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const tilesDrawnRef = useRef<boolean>(false);
  
  // Local state for selection preview (like TilePixelEditor)
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionPreview, setSelectionPreview] = useState<SelectionPreview | null>(null);
  const [startSelectionPos, setStartSelectionPos] = useState<{ x: number; y: number } | null>(null);
  
  const TILES_PER_ROW = useMemo(() => tileSize === 8 ? 4 : 3, [tileSize]);
  const SCALE_FACTOR = 8; // Keep consistent for visibility
  
  const [canvasWidth, canvasHeight] = useMemo(() => {
    const width = tileSize * TILES_PER_ROW * SCALE_FACTOR;
    const rows = Math.ceil(tileset.tiles.length / TILES_PER_ROW);
    const height = tileSize * rows * SCALE_FACTOR;
    return [width, height];
  }, [tileset.tiles.length, tileSize, TILES_PER_ROW]);

  // Draw static tiles once (separated from dynamic overlay)
  const drawStaticTiles = useCallback((ctx: CanvasRenderingContext2D) => {
    if (tilesDrawnRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (scaled)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1 * SCALE_FACTOR;

    // Horizontal grid lines (scaled)
    const totalRows = Math.ceil(tileset.tiles.length / TILES_PER_ROW);
    for (let y = 0; y <= totalRows; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * tileSize * SCALE_FACTOR);
      ctx.lineTo(canvasWidth, y * tileSize * SCALE_FACTOR);
      ctx.stroke();
    }

    // Vertical grid lines (scaled)
    for (let x = 0; x <= TILES_PER_ROW; x++) {
      ctx.beginPath();
      ctx.moveTo(x * tileSize * SCALE_FACTOR, 0);
      ctx.lineTo(x * tileSize * SCALE_FACTOR, canvasHeight);
      ctx.stroke();
    }

    // Draw tiles (scaled)
    tileset.tiles.forEach((tile, index) => {
      const gridX = index % TILES_PER_ROW;
      const gridY = Math.floor(index / TILES_PER_ROW);
      const startX = gridX * tileSize * SCALE_FACTOR;
      const startY = gridY * tileSize * SCALE_FACTOR;

      // Draw tile pixels (scaled up)
      for (let y = 0; y < tileSize; y++) {
        for (let x = 0; x < tileSize; x++) {
          ctx.fillStyle = GB_COLORS[tile.data[y]![x] ?? 0];
          ctx.fillRect(
            startX + x * SCALE_FACTOR,
