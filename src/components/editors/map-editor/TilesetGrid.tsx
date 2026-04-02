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

    normalizedTileset.tiles.forEach((tile) => {
      const position = normalizedTileset.layout?.positions[tile.id];
      if (!position) return;
      const gridX = position.x;
      const gridY = position.y;
      const startX = gridX * tilePixelSize;
      const startY = gridY * tilePixelSize;

      for (let y = 0; y < tileSize; y++) {
        for (let x = 0; x < tileSize; x++) {
          ctx.fillStyle = GB_COLORS[tile.data[y]![x] ?? 0];
          ctx.fillRect(startX + x * SCALE_FACTOR, startY + y * SCALE_FACTOR, SCALE_FACTOR, SCALE_FACTOR);
        }
      }
    });

    baseCanvasRef.current = baseCanvas;
  }, [normalizedTileset, canvasWidth, canvasHeight, rows, tileSize, tilePixelSize, tilesPerRow]);

  const drawFrame = useCallback((selection: typeof tileSelection) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const baseCanvas = baseCanvasRef.current;
    if (baseCanvas) {
      ctx.drawImage(baseCanvas, 0, 0);
    }

    if (selection.hasSelection && selection.width > 0 && selection.height > 0) {
      const scaledX = selection.x * tilePixelSize;
      const scaledY = selection.y * tilePixelSize;
      const scaledWidth = selection.width * tilePixelSize;
      const scaledHeight = selection.height * tilePixelSize;

      ctx.strokeStyle = "rgba(80, 200, 255, 1)";
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

      ctx.fillStyle = "rgba(80, 200, 255, 0.18)";
      ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
      return;
    }

    if (showSingleSelection && selectedTileIndex >= 0 && selectedTileIndex < normalizedTileset.tiles.length) {
      const selectedTile = normalizedTileset.tiles[selectedTileIndex];
      const position = selectedTile ? getTilesetPositionForTile(normalizedTileset, selectedTile.id) : null;
      if (!position) return;
      const scaledX = position.x * tilePixelSize;
      const scaledY = position.y * tilePixelSize;

      ctx.strokeStyle = "rgba(255, 214, 82, 1)";
      ctx.lineWidth = 2;
      ctx.strokeRect(scaledX, scaledY, tilePixelSize, tilePixelSize);

      ctx.fillStyle = "rgba(255, 214, 82, 0.22)";
      ctx.fillRect(scaledX, scaledY, tilePixelSize, tilePixelSize);
    }
  }, [normalizedTileset, selectedTileIndex, showSingleSelection, tilePixelSize]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => drawFrame(tileSelection));
    return () => window.cancelAnimationFrame(frame);
  }, [drawFrame, tileSelection]);

  const clampCell = useCallback((x: number, y: number) => ({
    x: Math.max(0, Math.min(tilesPerRow - 1, x)),
    y: Math.max(0, Math.min(rows - 1, y)),
