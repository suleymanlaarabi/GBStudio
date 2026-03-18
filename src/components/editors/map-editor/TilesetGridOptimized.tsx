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
