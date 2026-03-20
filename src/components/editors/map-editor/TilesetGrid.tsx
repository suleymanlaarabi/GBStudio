import React, { useRef, useEffect, useMemo, useCallback } from "react";
import { GB_COLORS } from "../../../constants/colors";
import { useStore } from "../../../store";
import type { Tileset } from "../../../types";
import { getTileAtTilesetPosition, getTilesetPositionForTile, normalizeTilesetLayout } from "../../../services/tileService";

const SCALE_FACTOR = 8;

interface TilesetGridProps {
  tileset: Tileset;
  tileSize: number;
  selectedTileIndex: number;
  showSingleSelection: boolean;
  onTileSelectionStart: (x: number, y: number) => void;
  onTileSelectionUpdate: (x: number, y: number) => void;
  onTileSelectionEnd: () => void;
}

export const TilesetGrid: React.FC<TilesetGridProps> = ({
  tileset,
  tileSize,
  selectedTileIndex,
  showSingleSelection,
  onTileSelectionStart,
  onTileSelectionUpdate,
  onTileSelectionEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPointerDownRef = useRef(false);
  const lastEmittedCellRef = useRef<{ x: number; y: number } | null>(null);

  const normalizedTileset = useMemo(() => normalizeTilesetLayout(tileset), [tileset]);
  const tilesPerRow = normalizedTileset.layout?.columns ?? (tileSize === 8 ? 4 : 3);
  const tilePixelSize = tileSize * SCALE_FACTOR;

  const rows = useMemo(() => {
    const positions = Object.values(normalizedTileset.layout?.positions ?? {});
    const maxRow = positions.reduce((highest, position) => Math.max(highest, position.y), 0);
    return Math.max(1, maxRow + 1);
