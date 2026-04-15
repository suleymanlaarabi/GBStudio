import React, { useEffect, useRef } from "react";
import { GB_COLORS } from "../../../constants/colors";
import type {
  TileMap,
  Tileset,
  MapTool,
  MapSelectionState,
} from "../../../types";
import {
  normalizeBounds,
  drawSelectionOverlay,
  drawLineOverlay,
  getMapCursor,
} from "./utils";
import type { CellCoords } from "./types";

interface MapCanvasProps {
  map: TileMap;
  tilesets: Tileset[];
  zoom: number;
  tileSize: number;
  unitSize: number;
  isDrawing: boolean;
  dragStart: CellCoords | null;
  hoverCell: CellCoords | null;
  mapTool: MapTool;
  mapSelection: MapSelectionState;
  mapShapeFilled: boolean;
  onMouseDown: (
    event: React.MouseEvent<HTMLCanvasElement>,
    coords: CellCoords,
  ) => void;
  onMouseMove: (
    event: React.MouseEvent<HTMLCanvasElement>,
    coords: CellCoords | null,
  ) => void;
  onMouseUp: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseLeave: (event: React.MouseEvent<HTMLCanvasElement>) => void;
}

export const MapCanvas: React.FC<MapCanvasProps> = ({
  map,
  tilesets,
  zoom,
  tileSize,
  unitSize,
  isDrawing,
  dragStart,
  hoverCell,
  mapTool,
  mapSelection,
  mapShapeFilled,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getMapCoords = (event: React.MouseEvent): CellCoords | null => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return null;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / unitSize);
    const y = Math.floor((event.clientY - rect.top) / unitSize);
    if (x < 0 || x >= map.width || y < 0 || y >= map.height) return null;
    return { x, y };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !map) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    map.data.forEach((row, my) => {
      row.forEach((cell, mx) => {
        if (!cell) return;
        const ts = tilesets.find((t) => t.id === cell.tilesetId);
        const tile = ts?.tiles[cell.tileIndex];
        if (!tile) return;

        for (let y = 0; y < tileSize; y++) {
          for (let x = 0; x < tileSize; x++) {
            ctx.fillStyle = GB_COLORS[tile.data[y]![x]!];
            ctx.fillRect(
              mx * unitSize + x * zoom,
              my * unitSize + y * zoom,
              zoom,
              zoom,
            );
          }
        }
      });
    });

    if (isDrawing && dragStart && hoverCell) {
      if (mapTool === "rectangle") {
        drawSelectionOverlay(
          ctx,
          normalizeBounds(dragStart, hoverCell),
          unitSize,
          "rgba(255,255,255,0.9)",
          mapShapeFilled ? "rgba(255,255,255,0.18)" : undefined,
        );
      } else if (mapTool === "line") {
        drawLineOverlay(ctx, dragStart, hoverCell, unitSize);
      } else if (mapTool === "select") {
        drawSelectionOverlay(
          ctx,
          normalizeBounds(dragStart, hoverCell),
          unitSize,
          "rgba(80,200,255,1)",
          "rgba(80,200,255,0.18)",
        );
      }
    } else if (mapSelection.hasSelection) {
      drawSelectionOverlay(
        ctx,
        mapSelection,
        unitSize,
        "rgba(80,200,255,1)",
        "rgba(80,200,255,0.18)",
      );
    }

    if (zoom > 1) {
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= map.width; i++) {
        ctx.beginPath();
        ctx.moveTo(i * unitSize, 0);
        ctx.lineTo(i * unitSize, map.height * unitSize);
        ctx.stroke();
      }
      for (let i = 0; i <= map.height; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * unitSize);
        ctx.lineTo(map.width * unitSize, i * unitSize);
        ctx.stroke();
      }
    }
  }, [
    dragStart,
    hoverCell,
    isDrawing,
    map,
    mapSelection,
    mapShapeFilled,
    mapTool,
    tileSize,
    tilesets,
    unitSize,
    zoom,
  ]);

  return (
    <div
      className="map-editor-container"
      style={{
        flex: 1,
        overflow: "auto",
        background: "#000",
      }}
    >
      <canvas
        ref={canvasRef}
        width={map.width * unitSize}
        height={map.height * unitSize}
        style={{
          cursor: getMapCursor(mapTool, isDrawing),
          boxShadow: "0 0 40px rgba(0,0,0,0.5)",
          imageRendering: "pixelated",
          display: "block",
          margin: "auto",
        }}
        onMouseDown={(e) => {
          const coords = getMapCoords(e);
          if (coords) onMouseDown(e, coords);
        }}
        onMouseMove={(e) => {
          const coords = getMapCoords(e);
          onMouseMove(e, coords);
        }}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      />
    </div>
  );
};
