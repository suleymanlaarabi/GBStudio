import React, { useEffect, useRef, useState, useCallback } from "react";
import { GB_COLORS } from "../../../constants/colors";
import type {
import type { Chunk } from "../../../types/map";
import { CHUNK_SIZE } from "../../../types/map";
import {
import type { CellCoords } from "./types";
  TileMap,
  Tileset,
  MapTool,
  MapSelectionState,
  SpriteAsset,
} from "../../../types";
  normalizeBounds,
  drawSelectionOverlay,
  drawLineOverlay,
  getMapCursor,
} from "./utils";

// Pre-parsed GB_COLORS for fast ImageData writes (module-level, done once)
const GB_COLORS_RGB = GB_COLORS.map((hex) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
}));

const MAX_TILE_CHUNK_CACHE = 512;  // ~32MB for 8px tiles (128×128×4 bytes each)
const MAX_COLL_CHUNK_CACHE = 1024; // ~256KB (16×16×1 byte each)

interface MapCanvasProps {
  map: TileMap;
  tilesets: Tileset[];
  sprites: SpriteAsset[];
  activeSpriteIndex: number;
  activeLayerIsWindow: boolean;
  zoom: number;
  setZoom: (zoom: number) => void;
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
  sprites,
  activeSpriteIndex,
  activeLayerIsWindow,
  zoom,
  setZoom,
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
  const containerRef = useRef<HTMLDivElement>(null);

  // High-frequency state refs (avoid React re-renders on every frame)
  const cameraRef = useRef({ x: 0, y: 0 });
  const zoomRef = useRef(zoom);
  const unitSizeRef = useRef(unitSize);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const dragStartRef = useRef<CellCoords | null>(null);
  const hoverCellRef = useRef<CellCoords | null>(null);
  const isPanningRef = useRef(false);
  const [isPanningState, setIsPanningState] = useState(false);

  // Sync props to refs
  const latestProps = useRef({
    map,
    tilesets,
    sprites,
    activeSpriteIndex,
    activeLayerIsWindow,
    isDrawing,
    mapTool,
    mapSelection,
    mapShapeFilled,
    tileSize,
  });

  useEffect(() => {
    latestProps.current = {
      map,
      tilesets,
      sprites,
      activeSpriteIndex,
      activeLayerIsWindow,
      isDrawing,
      mapTool,
      mapSelection,
      mapShapeFilled,
      tileSize,
    };
    zoomRef.current = zoom;
    unitSizeRef.current = unitSize;
    dragStartRef.current = dragStart;
    hoverCellRef.current = hoverCell;
  }, [
    map,
    tilesets,
    sprites,
    activeSpriteIndex,
    activeLayerIsWindow,
    isDrawing,
    mapTool,
    mapSelection,
    mapShapeFilled,
    tileSize,
    zoom,
    unitSize,
    dragStart,
    hoverCell,
  ]);

  const lastMousePos = useRef({ x: 0, y: 0 });
  const isSpacePressed = useRef(false);

  // --- Tileset canvas cache (pixel-data → offscreen canvas, built once via ImageData) ---
  const tilesetCache = useRef<Map<string, HTMLCanvasElement>>(new Map());
  const getTilesetCanvas = useCallback((ts: Tileset, tSize: number): HTMLCanvasElement => {
    const key = `${ts.id}-${tSize}`;
    const cached = tilesetCache.current.get(key);
    if (cached) return cached;

    const tilesPerRow = 16;
    const canvas = document.createElement("canvas");
    canvas.width = tilesPerRow * tSize;
    canvas.height = Math.ceil(ts.tiles.length / tilesPerRow) * tSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const buf = imageData.data;

    ts.tiles.forEach((tile, index) => {
      const originX = (index % tilesPerRow) * tSize;
      const originY = Math.floor(index / tilesPerRow) * tSize;
      tile.data.forEach((row, py) => {
        row.forEach((pixel, px) => {
          if (pixel === null || pixel === undefined) return;
          const color = GB_COLORS_RGB[pixel];
          if (!color) return;
          const i = ((originY + py) * canvas.width + (originX + px)) * 4;
          buf[i] = color.r;
          buf[i + 1] = color.g;
          buf[i + 2] = color.b;
          buf[i + 3] = 255;
        });
      });
    });

    ctx.putImageData(imageData, 0, 0);
    tilesetCache.current.set(key, canvas);
    return canvas;
  }, []);

  // --- Chunk canvas cache (16×16 tiles → one offscreen canvas per chunk per layer) ---
  // Cache entry uses chunk object reference for O(1) dirty detection (immutable update pattern)
  const chunkCanvasCache = useRef<Map<string, { canvas: HTMLCanvasElement; chunkRef: Chunk }>>(new Map());
  const collisionChunkCache = useRef<Map<string, { canvas: HTMLCanvasElement; gridRef: boolean[][] }>>(new Map());
  const lastMapIdRef = useRef<string | null>(null);

  const getChunkCanvas = useCallback((
    layerId: string,
    chunk: Chunk,
    cx: number,
    cy: number,
    curTileSize: number,
    tilesetMap: Map<string, Tileset>,
  ): HTMLCanvasElement => {
    const key = `${layerId}:${cx},${cy}:${curTileSize}`;
    const entry = chunkCanvasCache.current.get(key);

    if (entry && entry.chunkRef === chunk) {
      // LRU: move to end so it's evicted last
      chunkCanvasCache.current.delete(key);
      chunkCanvasCache.current.set(key, entry);
      return entry.canvas;
    }

    // Cache miss or stale — rebuild this chunk's canvas
    const size = CHUNK_SIZE * curTileSize;
    const canvas = (entry?.canvas && entry.canvas.width === size)
      ? entry.canvas
      : document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx2 = canvas.getContext("2d");
    if (!ctx2) return canvas;

    ctx2.clearRect(0, 0, size, size);
    ctx2.imageSmoothingEnabled = false;

    chunk.data.forEach((row, ry) => {
      row.forEach((cell, rx) => {
        if (!cell) return;
        const ts = tilesetMap.get(cell.tilesetId);
        if (!ts) return;
        const tsCanvas = getTilesetCanvas(ts, curTileSize);
        const sx = (cell.tileIndex % 16) * curTileSize;
        const sy = Math.floor(cell.tileIndex / 16) * curTileSize;
        ctx2.drawImage(tsCanvas, sx, sy, curTileSize, curTileSize, rx * curTileSize, ry * curTileSize, curTileSize, curTileSize);
      });
    });

    chunkCanvasCache.current.delete(key);
    chunkCanvasCache.current.set(key, { canvas, chunkRef: chunk });

    // FIFO eviction when over limit
    if (chunkCanvasCache.current.size > MAX_TILE_CHUNK_CACHE) {
      const oldest = chunkCanvasCache.current.keys().next().value;
      if (oldest !== undefined) chunkCanvasCache.current.delete(oldest);
    }

    return canvas;
  }, [getTilesetCanvas]);

  const getCollisionChunkCanvas = useCallback((
    grid: boolean[][],
    cx: number,
    cy: number,
  ): HTMLCanvasElement => {
    const key = `${cx},${cy}`;
    const entry = collisionChunkCache.current.get(key);

    if (entry && entry.gridRef === grid) {
      collisionChunkCache.current.delete(key);
      collisionChunkCache.current.set(key, entry);
      return entry.canvas;
    }

    // 1 pixel per cell — drawImage scales it to screen size
