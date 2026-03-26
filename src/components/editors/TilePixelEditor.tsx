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
      },
      {
        matcher: (event) => event.key === "Escape" && selection.hasSelection,
        handler: () => {
          setIsMovingSelection(false);
          setIsSelecting(false);
          clearSelection();
          setPreviewData(null);
        },
      },
    ],
  });

  const getTileCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: Math.floor((e.clientX - rect.left) / pixelSize),
      y: Math.floor((e.clientY - rect.top) / pixelSize),
    };
  }, [pixelSize]);

  const getPreciseTileCoords = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / pixelSize,
      y: (e.clientY - rect.top) / pixelSize,
    };
  }, [pixelSize]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getTileCoords(e);
    if (!coords || !tile) return;
    const { x, y } = coords;

    setIsDrawing(true);

    if (tool === "select") {
      if (selection.hasSelection && isPointInSelection(x, y, selection)) {
        setIsMovingSelection(true);
        setMoveOffset({ x: x - selection.x, y: y - selection.y });
        setOriginalSelectionPos({ x: selection.x, y: selection.y });
      } else {
        setIsSelecting(true);
        beginSelection(x, y);
        setStartPos({ x, y });
      }
      return;
    }

    if (tool === "square" || tool === "circle") {
      const preciseCoords = getPreciseTileCoords(e);
      if (preciseCoords) setStartPos(preciseCoords);
      return;
    }

    if (tool === "bucket") {
      if (x >= 0 && x < tile.size && y >= 0 && y < tile.size) {
        floodFill(activeTilesetIndex, activeTileIndex, x, y, selectedColor);
      }
      return;
    }

    const colorToApply: GBColor | null = tool === "eraser" ? null : selectedColor;
    if (x >= 0 && x < tile.size && y >= 0 && y < tile.size && tile.data[y]![x] !== colorToApply) {
      updatePixel(activeTilesetIndex, activeTileIndex, x, y, colorToApply);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getTileCoords(e);
    if (!coords || !tile || !isDrawing) return;
    const { x, y } = coords;

    if (isMovingSelection && selection.hasSelection) {
      const newX = x - moveOffset.x;
      const newY = y - moveOffset.y;
      updateSelectionBounds(newX, newY);
    } else if (isSelecting && startPos) {
      updateSelection(x, y);
    } else if ((tool === "square" || tool === "circle") && startPos) {
      const preciseCoords = getPreciseTileCoords(e);
      if (!preciseCoords) return;

      setLastPrecisePos(preciseCoords);
      const minX = Math.min(Math.floor(startPos.x), Math.floor(preciseCoords.x));
      const maxX = Math.max(Math.floor(startPos.x), Math.floor(preciseCoords.x));
      const minY = Math.min(Math.floor(startPos.y), Math.floor(preciseCoords.y));
      const maxY = Math.max(Math.floor(startPos.y), Math.floor(preciseCoords.y));
      const width = maxX - minX + 1;
      const height = maxY - minY + 1;
      let previewDataTemp: (GBColor | null)[][] = tile.data.map((row) => [...row]);

      if (tool === "square") {
        previewDataTemp = drawRectangle(previewDataTemp, minX, minY, width, height, selectedColor, true);
      } else {
        const circle = getCircleFromBounds(minX, minY, maxX, maxY);
        previewDataTemp = drawCircle(previewDataTemp, circle.centerX, circle.centerY, circle.radiusX, circle.radiusY, selectedColor, true);
      }

      setPreviewData(previewDataTemp);
    } else if (tool === "pencil" || tool === "eraser") {
      const colorToApply: GBColor | null = tool === "eraser" ? null : selectedColor;
      if (x >= 0 && x < tile.size && y >= 0 && y < tile.size && tile.data[y]![x] !== colorToApply) {
        updatePixel(activeTilesetIndex, activeTileIndex, x, y, colorToApply);
      }
    }
  };

