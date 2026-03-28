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
  }, [normalizedTileset]);
  const canvasWidth = tilePixelSize * tilesPerRow;
  const canvasHeight = tilePixelSize * rows;

  const { tileSelection } = useStore();

  useEffect(() => {
    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = canvasWidth;
    baseCanvas.height = canvasHeight;

    const ctx = baseCanvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;

    for (let y = 0; y <= rows; y++) {
      const lineY = y * tilePixelSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, lineY);
      ctx.lineTo(canvasWidth, lineY);
      ctx.stroke();
    }

    for (let x = 0; x <= tilesPerRow; x++) {
      const lineX = x * tilePixelSize + 0.5;
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, canvasHeight);
      ctx.stroke();
    }
