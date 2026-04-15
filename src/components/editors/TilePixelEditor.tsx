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
  const [previewData, setPreviewData] = useState<GBColor[][] | null>(null);
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

    const colorToApply = tool === "eraser" ? 0 : selectedColor;
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
      let previewDataTemp: GBColor[][] = tile.data.map((row) => [...row]);

      if (tool === "square") {
        previewDataTemp = drawRectangle(previewDataTemp, minX, minY, width, height, selectedColor, true);
      } else {
        const circle = getCircleFromBounds(minX, minY, maxX, maxY);
        previewDataTemp = drawCircle(previewDataTemp, circle.centerX, circle.centerY, circle.radiusX, circle.radiusY, selectedColor, true);
      }

      setPreviewData(previewDataTemp);
    } else if (tool === "pencil" || tool === "eraser") {
      const colorToApply = tool === "eraser" ? 0 : selectedColor;
      if (x >= 0 && x < tile.size && y >= 0 && y < tile.size && tile.data[y]![x] !== colorToApply) {
        updatePixel(activeTilesetIndex, activeTileIndex, x, y, colorToApply);
      }
    }
  };

  const handleMouseUp = () => {
    if (tile && startPos && (tool === "square" || tool === "circle") && lastPrecisePos) {
      const minX = Math.min(Math.floor(startPos.x), Math.floor(lastPrecisePos.x));
      const maxX = Math.max(Math.floor(startPos.x), Math.floor(lastPrecisePos.x));
      const minY = Math.min(Math.floor(startPos.y), Math.floor(lastPrecisePos.y));
      const maxY = Math.max(Math.floor(startPos.y), Math.floor(lastPrecisePos.y));
      const width = maxX - minX + 1;
      const height = maxY - minY + 1;

      if (tool === "square") {
        storeDrawRectangle(activeTilesetIndex, activeTileIndex, minX, minY, width, height, selectedColor, true);
      } else {
        const circle = getCircleFromBounds(minX, minY, maxX, maxY);
        storeDrawCircle(activeTilesetIndex, activeTileIndex, circle.centerX, circle.centerY, circle.radiusX, circle.radiusY, selectedColor, true);
      }
    }

    if (isMovingSelection && selection.hasSelection && originalSelectionPos) {
      const deltaX = selection.x - originalSelectionPos.x;
      const deltaY = selection.y - originalSelectionPos.y;
      if (deltaX !== 0 || deltaY !== 0) {
        // We need to move the content back to original, then apply the move
        // BUT moveSelection already takes current selection and moves its content.
        // Actually, moveSelection expects to move the content FROM current selection TO a new position.
        // My updateSelectionBounds moved the BOX but not the CONTENT.
        // So I need to:
        // 1. Restore the box to original position
        // 2. Call moveSelection with the delta
        updateSelectionBounds(originalSelectionPos.x, originalSelectionPos.y);
        moveSelection(deltaX, deltaY);
      }
    }

    if (isSelecting) endSelection();

    if (tool === "pencil" || tool === "eraser") {
      commit();
    }

    setIsDrawing(false);
    setIsSelecting(false);
    setIsMovingSelection(false);
    setPreviewData(null);
    setStartPos(null);
    setLastPrecisePos(null);
    setOriginalSelectionPos(null);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !tile) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderData = previewData || tile.data;
    renderData.forEach((row, y) => row.forEach((colorIndex, x) => {
      ctx.fillStyle = GB_COLORS[colorIndex];
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
      
      // Grille d'édition
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }));

    if (selection.hasSelection) {
      ctx.strokeStyle = isMovingSelection ? "rgba(134, 59, 255, 1)" : "rgba(134, 59, 255, 0.8)";
      ctx.lineWidth = isMovingSelection ? 3 : 2;
      ctx.strokeRect(selection.x * pixelSize, selection.y * pixelSize, selection.width * pixelSize, selection.height * pixelSize);
    }
  }, [tile, pixelSize, previewData, selection, isMovingSelection]);

  if (!tile || !tileset) return <div className="card">No tile selected</div>;

  return (
    <div className="card">
      <div className="section-title">Pixel Studio ({tile.size}x{tile.size})</div>
      <div style={{ display: "flex", justifyContent: "center", background: "#000", padding: "10px", borderRadius: "12px" }}>
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          style={{ cursor, imageRendering: "pixelated" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDrawing(false);
            setIsSelecting(false);
            setIsMovingSelection(false);
            setPreviewData(null);
          }}
        />
      </div>

      {selection.hasSelection && (
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "0.5rem" }}>
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 8px" }}
            onClick={flipSelectionHorizontal}
            title="Flip Horizontal (Ctrl+Shift+H)"
          >
            <FlipHorizontal size={14} />
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 8px" }}
            onClick={flipSelectionVertical}
            title="Flip Vertical (Ctrl+Shift+V)"
          >
            <FlipVertical size={14} />
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 8px" }}
            onClick={rotateSelectionClockwise}
            title="Rotate Clockwise (Ctrl+R)"
          >
            <RotateCw size={14} />
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 8px" }}
            onClick={rotateSelectionCounterClockwise}
            title="Rotate Counter-Clockwise (Ctrl+Shift+R)"
          >
            <RotateCcw size={14} />
          </button>
          <button
            className="btn btn-secondary"
            style={{ padding: "4px 8px" }}
            onClick={copySelection}
            title="Copy (Ctrl+C)"
          >
            <Copy size={14} />
          </button>
        </div>
      )}

      <p style={{ fontSize: "0.75rem", color: "#888", marginTop: "0.5rem", textAlign: "center" }}>
        {tileset.name} / Tile #{activeTileIndex} • Tool: {tool.toUpperCase()}
        {selection.hasSelection && ` • Selection: ${selection.width}x${selection.height}`}
      </p>
    </div>
  );
};
