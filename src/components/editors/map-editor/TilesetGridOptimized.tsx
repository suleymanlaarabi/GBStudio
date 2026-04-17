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
            startY + y * SCALE_FACTOR,
            SCALE_FACTOR,
            SCALE_FACTOR
          );
        }
      }
    });
    
    tilesDrawnRef.current = true;
  }, [tileset.tiles, tileSize, TILES_PER_ROW, canvasWidth, canvasHeight]);

  // Draw selection overlay (dynamic)
  const drawSelectionOverlay = useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Clear the overlay area (draw static content first to refresh)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw static tiles if not drawn yet
    if (!tilesDrawnRef.current) {
      drawStaticTiles(ctx);
    }

    // Draw selection preview (if active)
    if (isSelecting && selectionPreview && selectionPreview.width > 0 && selectionPreview.height > 0) {
      const scaledX = selectionPreview.x * SCALE_FACTOR;
      const scaledY = selectionPreview.y * SCALE_FACTOR;
      const scaledWidth = selectionPreview.width * SCALE_FACTOR;
      const scaledHeight = selectionPreview.height * SCALE_FACTOR;

      // Selection border
      ctx.strokeStyle = "rgba(80, 200, 255, 1)";
      ctx.lineWidth = 2 * SCALE_FACTOR;
      ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight);

      // Selection fill
      ctx.fillStyle = "rgba(80, 200, 255, 0.18)";
      ctx.fillRect(scaledX, scaledY, scaledWidth, scaledHeight);
    }
  }, [isSelecting, selectionPreview, drawStaticTiles]);

  // Main render loop using requestAnimationFrame
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawSelectionOverlay(ctx);
    
    rafRef.current = requestAnimationFrame(render);
  }, [drawSelectionOverlay]);

  // Start/stop render loop
  useEffect(() => {
    rafRef.current = requestAnimationFrame(render);
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [render]);

  // Redraw static tiles when dependencies change
  useEffect(() => {
    tilesDrawnRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    drawStaticTiles(ctx);
  }, [drawStaticTiles]);

  // Get tile coordinates from mouse event
  const getTileCoords = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / SCALE_FACTOR / tileSize);
    const y = Math.floor((event.clientY - rect.top) / SCALE_FACTOR / tileSize);
    
    return { x, y };
  }, [tileSize]);

  // Mouse handlers
  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getTileCoords(event);
    if (!coords) return;
    
    const { x, y } = coords;
    
    setIsSelecting(true);
    setStartSelectionPos({ x, y });
    setSelectionPreview({ x, y, width: 1, height: 1 });
    
    // Call the callback but don't update store yet
    onTileSelectionStart(x, y);
  }, [getTileCoords, onTileSelectionStart]);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting || !startSelectionPos) return;
    
    const coords = getTileCoords(event);
    if (!coords) return;
    
    const { x: currentX, y: currentY } = coords;
    const { x: startX, y: startY } = startSelectionPos;
    
    // Calculate selection bounds
    const minX = Math.min(startX, currentX);
    const maxX = Math.max(startX, currentX);
    const minY = Math.min(startY, currentY);
    const maxY = Math.max(startY, currentY);
    
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;
    
    // Update local preview state (fast, no store updates)
    setSelectionPreview({ x: minX, y: minY, width, height });
    
    // Only update store periodically (throttled) for smoother performance
    if (Math.abs(currentX - maxX) % 2 === 0 && Math.abs(currentY - maxY) % 2 === 0) {
      onTileSelectionUpdate(currentX, currentY);
    }
  }, [isSelecting, startSelectionPos, getTileCoords, onTileSelectionUpdate]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;
    
    // Update store with final selection when selection ends
    if (selectionPreview && selectionPreview.width > 0 && selectionPreview.height > 0) {
      onTileSelectionEnd();
    }
    
    // Reset local state
    setIsSelecting(false);
    setStartSelectionPos(null);
    setSelectionPreview(null);
  }, [isSelecting, selectionPreview, onTileSelectionEnd]);

  // Handle mouse leave (same as mouse up)
  const handleMouseLeave = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

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
        onMouseLeave={handleMouseLeave}
      />
    </div>
  );
};
