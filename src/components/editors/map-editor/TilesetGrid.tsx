import React, { useRef, useEffect, useMemo } from "react";
import { GB_COLORS } from "../../../constants/colors";
import { useStore } from "../../../store";
import type { Tileset } from "../../../types";

interface TilesetGridProps {
  tileset: Tileset;
  tileSize: number;
  selectedTiles: Array<Set<number>>; // 2D array showing which tiles are selected
  onTileSelectionStart: (x: number, y: number) => void;
  onTileSelectionUpdate: (x: number, y: number) => void;
  onTileSelectionEnd: () => void;
}

export const TilesetGrid: React.FC<TilesetGridProps> = ({
  tileset,
  tileSize,
  onTileSelectionStart,
  onTileSelectionUpdate,
  onTileSelectionEnd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const TILES_PER_ROW = tileSize === 8 ? 4 : 3;
  const SCALE_FACTOR = 8; // Scale factor to make tiles visible (8x larger)

  const [canvasWidth, canvasHeight] = useMemo(() => {
    const width = tileSize * TILES_PER_ROW * SCALE_FACTOR;
    const rows = Math.ceil(tileset.tiles.length / TILES_PER_ROW);
    const height = tileSize * rows * SCALE_FACTOR;
    return [width, height];
  }, [tileset, tileSize, TILES_PER_ROW, SCALE_FACTOR]);

  const { tileSelection } = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (scaled)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1 * SCALE_FACTOR;

    // Horizontal grid lines (scaled)
    for (let y = 0; y <= (tileset.tiles.length / TILES_PER_ROW) + 1; y++) {
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
          ctx.fillStyle = GB_COLORS[tile.data[y][x]];
          ctx.fillRect(
            startX + x * SCALE_FACTOR,
            startY + y * SCALE_FACTOR,
            SCALE_FACTOR,
            SCALE_FACTOR
          );
        }
      }
    });

    // Draw selection overlay (scaled)
    if (tileSelection.hasSelection && tileSelection.width > 0 && tileSelection.height > 0) {
      const scaledX = tileSelection.x * SCALE_FACTOR;
      const scaledY = tileSelection.y * SCALE_FACTOR;
      const scaledWidth = tileSelection.width * SCALE_FACTOR;
      const scaledHeight = tileSelection.height * SCALE_FACTOR;

      // Selection border
      ctx.strokeStyle = "rgba(80, 200, 255, 1)";
      ctx.lineWidth = 2 * SCALE_FACTOR;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

      // Selection fill
      ctx.fillStyle = "rgba(80, 200, 255, 0.18)";
      ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
    }
  }, [tileset, tileSize, canvasWidth, canvasHeight, tileSelection, TILES_PER_ROW]);

  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / SCALE_FACTOR / tileSize);
    const y = Math.floor((event.clientY - rect.top) / SCALE_FACTOR / tileSize);

    onTileSelectionStart(x, y);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (event.buttons !== 1) return; // Only when mouse is down

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / SCALE_FACTOR / tileSize);
    const y = Math.floor((event.clientY - rect.top) / SCALE_FACTOR / tileSize);

    onTileSelectionUpdate(x, y);
  };

  const handleMouseUp = () => {
    onTileSelectionEnd();
  };

  return (
    <div ref={containerRef} style={{ overflow: "auto", maxHeight: "400px" }}>
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          imageRendering: "pixelated",
          display: "block",
          background: "#000",
          cursor: "crosshair",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
};
