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

    // Clear
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, curW, curH);

    ctx.save();
    ctx.translate(
      -Math.round(curCamera.x * curUnitSize),
      -Math.round(curCamera.y * curUnitSize),
    );
    ctx.imageSmoothingEnabled = false;

    const startX = Math.floor(curCamera.x);
    const startY = Math.floor(curCamera.y);
    const endX = Math.ceil(curCamera.x + curW / curUnitSize);
    const endY = Math.ceil(curCamera.y + curH / curUnitSize);

    const startChunkX = Math.floor(startX / CHUNK_SIZE);
    const startChunkY = Math.floor(startY / CHUNK_SIZE);
    const endChunkX = Math.floor(endX / CHUNK_SIZE);
    const endChunkY = Math.floor(endY / CHUNK_SIZE);

    // Build tileset lookup
    const tilesetMap = new Map<string, Tileset>();
    curTilesets.forEach((ts) => tilesetMap.set(ts.id, ts));

    const chunkDestSize = CHUNK_SIZE * curUnitSize;

    // --- Tile layers: one drawImage per chunk instead of per tile ---
    for (const layer of curMap.layers) {
      if (!layer.visible) continue;
      for (let cy = startChunkY - 1; cy <= endChunkY + 1; cy++) {
        for (let cx = startChunkX - 1; cx <= endChunkX + 1; cx++) {
          const chunk = layer.chunks[`${cx},${cy}`];
          if (!chunk) continue;

          const chunkCanvas = getChunkCanvas(layer.id, chunk, cx, cy, curTileSize, tilesetMap);
          ctx.drawImage(
            chunkCanvas,
            cx * CHUNK_SIZE * curUnitSize,
            cy * CHUNK_SIZE * curUnitSize,
            chunkDestSize,
            chunkDestSize,
          );
        }
      }
    }

    // Grid — single batched path
    if (curZoom > 3) {
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = startX; x <= endX + 1; x++) {
        ctx.moveTo(x * curUnitSize, startY * curUnitSize);
        ctx.lineTo(x * curUnitSize, (endY + 1) * curUnitSize);
      }
      for (let y = startY; y <= endY + 1; y++) {
        ctx.moveTo(startX * curUnitSize, y * curUnitSize);
        ctx.lineTo((endX + 1) * curUnitSize, y * curUnitSize);
      }
      ctx.stroke();
    }

    // --- Collision overlay: one drawImage per chunk (16×16→screen) ---
    if (curMap.collisionData) {
      for (let cy = startChunkY - 1; cy <= endChunkY + 1; cy++) {
        for (let cx = startChunkX - 1; cx <= endChunkX + 1; cx++) {
          const grid = curMap.collisionData[`${cx},${cy}`];
          if (!grid) continue;

          const collCanvas = getCollisionChunkCanvas(grid, cx, cy);
          ctx.drawImage(
            collCanvas,
            cx * CHUNK_SIZE * curUnitSize,
            cy * CHUNK_SIZE * curUnitSize,
            chunkDestSize,
            chunkDestSize,
          );
        }
      }
    }

    // Camera spawn marker
    if (curMap.cameraSpawn) {
      const sx = curMap.cameraSpawn.x;
      const sy = curMap.cameraSpawn.y;
      ctx.fillStyle = "rgba(255,220,0,0.5)";
      ctx.fillRect(sx * curUnitSize, sy * curUnitSize, curUnitSize, curUnitSize);
      ctx.strokeStyle = "#ffe000";
      ctx.lineWidth = 2;
      ctx.strokeRect(sx * curUnitSize + 1, sy * curUnitSize + 1, curUnitSize - 2, curUnitSize - 2);
      const cx2 = sx * curUnitSize + curUnitSize / 2;
      const cy2 = sy * curUnitSize + curUnitSize / 2;
      const arm = curUnitSize * 0.35;
      ctx.beginPath();
      ctx.moveTo(cx2 - arm, cy2);
      ctx.lineTo(cx2 + arm, cy2);
      ctx.moveTo(cx2, cy2 - arm);
      ctx.lineTo(cx2, cy2 + arm);
      ctx.stroke();
    }

    // --- Sprite instances ---
    if (curMap.spriteInstances && curMap.spriteInstances.length > 0) {
      for (const inst of curMap.spriteInstances) {
        const spriteAsset = curSprites.find((s) => s.id === inst.spriteAssetId);
        if (!spriteAsset) continue;
        const anim = spriteAsset.animations.find((a) => a.id === inst.animationId) ?? spriteAsset.animations[0];
        if (!anim || anim.frames.length === 0) continue;
        const frame = anim.frames[0]!;
        const ts = tilesetMap.get(frame.tilesetId);
        if (!ts) continue;
        const tsCanvas = getTilesetCanvas(ts, curTileSize);
        const sx = (frame.tileIndex % 16) * curTileSize;
        const sy = Math.floor(frame.tileIndex / 16) * curTileSize;

        ctx.save();
        if (inst.flipH || inst.flipV) {
          ctx.translate(
            inst.flipH ? (inst.x + 1) * curUnitSize : 0,
            inst.flipV ? (inst.y + 1) * curUnitSize : 0,
          );
          ctx.scale(inst.flipH ? -1 : 1, inst.flipV ? -1 : 1);
          const drawX = inst.flipH ? -inst.x * curUnitSize - curUnitSize : inst.x * curUnitSize;
          const drawY = inst.flipV ? -inst.y * curUnitSize - curUnitSize : inst.y * curUnitSize;
          ctx.drawImage(tsCanvas, sx, sy, curTileSize, curTileSize, drawX, drawY, curUnitSize, curUnitSize);
        } else {
          ctx.drawImage(tsCanvas, sx, sy, curTileSize, curTileSize, inst.x * curUnitSize, inst.y * curUnitSize, curUnitSize, curUnitSize);
        }
        // Highlight selected instance
        if (inst.id === null) {
          ctx.strokeStyle = "rgba(255,220,0,0.9)";
          ctx.lineWidth = 2;
          ctx.strokeRect(inst.x * curUnitSize + 1, inst.y * curUnitSize + 1, curUnitSize - 2, curUnitSize - 2);
        }
        ctx.restore();
      }
    }

    // Ghost preview for sprite_place tool
    if (curMapTool === "sprite_place" && hc) {
      const spriteAsset = curSprites[curActiveSpriteIndex];
      if (spriteAsset) {
        const anim = spriteAsset.animations[0];
        if (anim && anim.frames.length > 0) {
          const frame = anim.frames[0]!;
          const ts = tilesetMap.get(frame.tilesetId);
          if (ts) {
            const tsCanvas = getTilesetCanvas(ts, curTileSize);
            const sx = (frame.tileIndex % 16) * curTileSize;
            const sy = Math.floor(frame.tileIndex / 16) * curTileSize;
            ctx.globalAlpha = 0.55;
            ctx.drawImage(tsCanvas, sx, sy, curTileSize, curTileSize, hc.x * curUnitSize, hc.y * curUnitSize, curUnitSize, curUnitSize);
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    // Tools and selection overlays
    if (curIsDrawing && ds && hc) {
      const bounds = normalizeBounds(ds, hc);
      if (curMapTool === "rectangle")
        drawSelectionOverlay(ctx, bounds, curUnitSize, "rgba(255,255,255,0.9)", curMapShapeFilled ? "rgba(255,255,255,0.18)" : undefined);
      else if (curMapTool === "line")
        drawLineOverlay(ctx, ds, hc, curUnitSize);
      else if (curMapTool === "select")
        drawSelectionOverlay(ctx, bounds, curUnitSize, "rgba(80,200,255,1)", "rgba(80,200,255,0.18)");
    } else if (curMapSelection.hasSelection) {
      drawSelectionOverlay(ctx, curMapSelection, curUnitSize, "rgba(80,200,255,1)", "rgba(80,200,255,0.18)");
    }

    ctx.restore();

    // --- Window layer (screen-space, rendered after world transform is removed) ---
    if (curMap.windowLayer?.enabled && curActiveLayerIsWindow) {
      const wl = curMap.windowLayer;
      const wOffX = wl.wx * curUnitSize;
      const wOffY = wl.wy * curUnitSize;
      ctx.save();
      ctx.translate(wOffX, wOffY);
      ctx.imageSmoothingEnabled = false;

      // Tinted background for window area
      ctx.fillStyle = "rgba(0,0,60,0.35)";
      ctx.fillRect(0, 0, curW - wOffX, curH - wOffY);

      // Draw window layer chunks in screen-space (not world-space)
      const wStartCX = 0;
      const wStartCY = 0;
      const wEndCX = Math.ceil((curW - wOffX) / chunkDestSize);
      const wEndCY = Math.ceil((curH - wOffY) / chunkDestSize);

      for (let cy = wStartCY; cy <= wEndCY; cy++) {
        for (let cx = wStartCX; cx <= wEndCX; cx++) {
          const chunk = wl.layer.chunks[`${cx},${cy}`];
          if (!chunk) continue;
          const chunkCanvas = getChunkCanvas(wl.layer.id, chunk, cx, cy, curTileSize, tilesetMap);
          ctx.drawImage(chunkCanvas, cx * chunkDestSize, cy * chunkDestSize, chunkDestSize, chunkDestSize);
        }
      }

      // Window layer border
      ctx.strokeStyle = "rgba(100,180,255,0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(0, 0, curW - wOffX, curH - wOffY);
      ctx.setLineDash([]);

      ctx.restore();
    }
  }, [getTilesetCanvas, getChunkCanvas, getCollisionChunkCanvas]);

  // Main RAF loop
  useEffect(() => {
    let frameId: number;
    const loop = () => {
      render();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [render]);

  return (
    <div
      ref={containerRef}
      className="map-editor-container"
      style={{
        flex: 1,
        maxHeight: "400px",
        minHeight: "480px",
        overflow: "hidden",
        background: "#111",
        position: "relative",
        border: "1px solid #333",
        borderRadius: "4px",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          cursor: isPanningState ? "grabbing" : getMapCursor(mapTool, isDrawing),
          imageRendering: "pixelated",
          display: "block",
        }}
        onMouseDown={handleMouseDownInternal}
        onMouseMove={handleMouseMoveInternal}
        onMouseUp={handleMouseUpInternal}
        onMouseLeave={onMouseLeave}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};
