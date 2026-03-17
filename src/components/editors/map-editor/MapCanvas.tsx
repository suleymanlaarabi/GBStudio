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
