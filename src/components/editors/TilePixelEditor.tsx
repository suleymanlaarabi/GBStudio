import React, { useCallback, useEffect, useRef, useState } from "react";
import { Copy, FlipHorizontal, FlipVertical, RotateCw, RotateCcw } from "lucide-react";
import { GB_COLORS } from "../../constants/colors";
import { useStore } from "../../store";
import { useKeyboardShortcuts } from "../../store/hooks/useKeyboardShortcuts";
import type { GBColor } from "../../types";
import { drawCircle, drawRectangle, getCircleFromBounds, isPointInSelection } from "../../utils";

export const TilePixelEditor: React.FC = () => {
  const {
    tilesets, activeTilesetIndex, activeTileIndex,
    updatePixel, floodFill, selectedColor, tool, commit,
    selection, beginSelection, updateSelection, endSelection,
    drawRectangle: storeDrawRectangle, drawCircle: storeDrawCircle,
    moveSelection, updateSelectionBounds, copySelection, pasteSelection, deleteSelection, clearSelection,
    flipSelectionHorizontal, flipSelectionVertical, rotateSelectionClockwise, rotateSelectionCounterClockwise,
  } = useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [lastPrecisePos, setLastPrecisePos] = useState<{ x: number; y: number } | null>(null);
  const [previewData, setPreviewData] = useState<(GBColor | null)[][] | null>(null);
  const [isMovingSelection, setIsMovingSelection] = useState(false);
  const [moveOffset, setMoveOffset] = useState({ x: 0, y: 0 });
  const [originalSelectionPos, setOriginalSelectionPos] = useState<{ x: number; y: number } | null>(null);

  const tileset = tilesets[activeTilesetIndex];
  const tile = tileset?.tiles[activeTileIndex];
  const canvasSize = 320;
  const gridSize = tile?.size || 8;
  const pixelSize = canvasSize / gridSize;
  const cursor =
    isMovingSelection ? "grabbing" :
    tool === "select" && selection.hasSelection ? "grab" :
    tool === "bucket" ? "cell" :
    tool === "eraser" ? "not-allowed" :
    tool === "square" || tool === "circle" ? "crosshair" :
    "crosshair";

  useKeyboardShortcuts({
    shortcuts: [
      {
        matcher: (event) => (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c",
        handler: (event) => {
          event.preventDefault();
          copySelection();
        },
      },
      {
        matcher: (event) => (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v",
        handler: (event) => {
          event.preventDefault();
          pasteSelection(0, 0);
        },
      },
      {
        matcher: (event) => event.key === "Delete" || event.key === "Backspace",
        handler: (event) => {
          event.preventDefault();
          deleteSelection();
        },
