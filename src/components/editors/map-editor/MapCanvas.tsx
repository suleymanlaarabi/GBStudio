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
    const canvas = entry?.canvas ?? document.createElement("canvas");
    canvas.width = CHUNK_SIZE;
    canvas.height = CHUNK_SIZE;
    const ctx2 = canvas.getContext("2d");
    if (!ctx2) return canvas;

    ctx2.clearRect(0, 0, CHUNK_SIZE, CHUNK_SIZE);
    ctx2.fillStyle = "rgba(255,60,60,0.38)";
    for (let ry = 0; ry < CHUNK_SIZE; ry++) {
      const row = grid[ry];
      if (!row) continue;
      for (let rx = 0; rx < CHUNK_SIZE; rx++) {
        if (row[rx]) ctx2.fillRect(rx, ry, 1, 1);
      }
    }

    collisionChunkCache.current.delete(key);
    collisionChunkCache.current.set(key, { canvas, gridRef: grid });

    if (collisionChunkCache.current.size > MAX_COLL_CHUNK_CACHE) {
      const oldest = collisionChunkCache.current.keys().next().value;
      if (oldest !== undefined) collisionChunkCache.current.delete(oldest);
    }

    return canvas;
  }, []);

  // --- Dirty frame detection: skip render when nothing changed ---
  const lastFrameState = useRef({
    mapRef: null as TileMap | null,
    cameraX: NaN,
    cameraY: NaN,
    zoom: NaN,
    isDrawing: false,
    hoverX: NaN,
    hoverY: NaN,
    dragX: NaN,
    dragY: NaN,
    hasSelection: false,
    selX: 0, selY: 0, selW: 0, selH: 0,
    mapShapeFilled: false,
    mapTool: "" as MapTool | "",
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current && canvasRef.current) {
        const w = containerRef.current.clientWidth;
        const h = containerRef.current.clientHeight;
        dimensionsRef.current = { width: w, height: h };
        if (canvasRef.current.width !== w) canvasRef.current.width = w;
        if (canvasRef.current.height !== h) canvasRef.current.height = h;
      }
    };
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        isSpacePressed.current = true;
        if (e.target === document.body) e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") isSpacePressed.current = false;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const getMapCoords = useCallback(
    (clientX: number, clientY: number): CellCoords => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const worldX = (clientX - rect.left) / unitSizeRef.current + cameraRef.current.x;
      const worldY = (clientY - rect.top) / unitSizeRef.current + cameraRef.current.y;
      return { x: Math.floor(worldX), y: Math.floor(worldY) };
    },
    [],
  );

  const handleMouseDownInternal = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && isSpacePressed.current)) {
      isPanningRef.current = true;
      setIsPanningState(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }
    const coords = getMapCoords(e.clientX, e.clientY);
    onMouseDown(e, coords);
  };

  const handleMouseMoveInternal = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanningRef.current) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      cameraRef.current = {
        x: cameraRef.current.x - dx / unitSizeRef.current,
        y: cameraRef.current.y - dy / unitSizeRef.current,
      };
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }
    const coords = getMapCoords(e.clientX, e.clientY);
    onMouseMove(e, coords);
  };

  const handleMouseUpInternal = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      setIsPanningState(false);
      return;
    }
    onMouseUp(e);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        const zoomSpeed = 0.0015;
        const delta = -e.deltaY;
        const oldZoom = zoomRef.current;
        const newZoom = Math.max(0.1, Math.min(30, oldZoom + delta * zoomSpeed * oldZoom));

        if (newZoom !== oldZoom) {
          const rect = container.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          const worldMouseX = mouseX / (latestProps.current.tileSize * oldZoom) + cameraRef.current.x;
          const worldMouseY = mouseY / (latestProps.current.tileSize * oldZoom) + cameraRef.current.y;

          setZoom(newZoom);
          zoomRef.current = newZoom;
          const newUnitSize = latestProps.current.tileSize * newZoom;
          unitSizeRef.current = newUnitSize;

          cameraRef.current = {
            x: worldMouseX - mouseX / newUnitSize,
            y: worldMouseY - mouseY / newUnitSize,
          };
        }
      } else {
        cameraRef.current = {
          x: cameraRef.current.x + e.deltaX / unitSizeRef.current,
          y: cameraRef.current.y + e.deltaY / unitSizeRef.current,
        };
      }
    };

    container.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleNativeWheel);
  }, [setZoom]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const {
      map: curMap,
      tilesets: curTilesets,
      sprites: curSprites,
      activeSpriteIndex: curActiveSpriteIndex,
      activeLayerIsWindow: curActiveLayerIsWindow,
      isDrawing: curIsDrawing,
      mapTool: curMapTool,
      mapSelection: curMapSelection,
      mapShapeFilled: curMapShapeFilled,
      tileSize: curTileSize,
    } = latestProps.current;
    if (!curMap) return;

    const curUnitSize = unitSizeRef.current;
    const { width: curW, height: curH } = dimensionsRef.current;
    const curCamera = cameraRef.current;
    const curZoom = zoomRef.current;
    const hc = hoverCellRef.current;
    const ds = dragStartRef.current;

    // --- Dirty check: skip frame if nothing changed ---
    const lf = lastFrameState.current;
    if (
      lf.mapRef === curMap &&
      lf.cameraX === curCamera.x &&
      lf.cameraY === curCamera.y &&
      lf.zoom === curZoom &&
      lf.isDrawing === curIsDrawing &&
      lf.hoverX === (hc?.x ?? NaN) &&
      lf.hoverY === (hc?.y ?? NaN) &&
      lf.dragX === (ds?.x ?? NaN) &&
      lf.dragY === (ds?.y ?? NaN) &&
      lf.hasSelection === curMapSelection.hasSelection &&
      lf.selX === curMapSelection.x &&
      lf.selY === curMapSelection.y &&
      lf.selW === curMapSelection.width &&
      lf.selH === curMapSelection.height &&
      lf.mapShapeFilled === curMapShapeFilled &&
      lf.mapTool === curMapTool &&
      lf.width === curW &&
      lf.height === curH
    ) {
      return;
    }

    lastFrameState.current = {
      mapRef: curMap,
      cameraX: curCamera.x,
      cameraY: curCamera.y,
      zoom: curZoom,
      isDrawing: curIsDrawing,
      hoverX: hc?.x ?? NaN,
      hoverY: hc?.y ?? NaN,
      dragX: ds?.x ?? NaN,
      dragY: ds?.y ?? NaN,
      hasSelection: curMapSelection.hasSelection,
      selX: curMapSelection.x,
      selY: curMapSelection.y,
      selW: curMapSelection.width,
      selH: curMapSelection.height,
      mapShapeFilled: curMapShapeFilled,
      mapTool: curMapTool,
      width: curW,
      height: curH,
    };

    // Clear caches when map switches
    if (curMap.id !== lastMapIdRef.current) {
      chunkCanvasCache.current.clear();
      collisionChunkCache.current.clear();
      tilesetCache.current.clear();
      lastMapIdRef.current = curMap.id;
    }

