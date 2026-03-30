import { useRef, useState, useMemo } from "react";
import { useStore } from "../../../store";
import type { TileCell, TileMap, Tileset } from "../../../types";
import { normalizeBounds } from "./utils";
import type { CellCoords } from "./types";

interface UseMapEditorInteractionProps {
  map: TileMap | undefined;
  activeMapIndex: number;
  activeTileset: Tileset | undefined;
  activeTileIndex: number;
}

export const useMapEditorInteraction = ({
  map,
  activeMapIndex,
  activeTileset,
  activeTileIndex,
}: UseMapEditorInteractionProps) => {
  const {
    batchUpdateMapCells,
    batchUpdateWindowCells,
    batchSetCollisionCells,
    fillMap,
    drawMapLine,
    drawMapRectangle,
    mapTool,
    mapShapeFilled,
    beginMapSelection,
    updateMapSelection,
    endMapSelection,
    pickMapCell,
    setCameraSpawn,
    addSpriteInstance,
    removeSpriteInstance,
    activeSpriteIndex,
    sprites,
    selectedSpriteInstanceId,
    setSelectedSpriteInstance,
    commit,
  } = useStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<CellCoords | null>(null);
  const [hoverCell, setHoverCell] = useState<CellCoords | null>(null);
  const isErasingCollisionRef = useRef(false);

  // Batching buffers — accumulated during mousemove, flushed to Zustand via RAF or on mouseUp
  const pendingPaintCells = useRef<Array<{ x: number; y: number; cell: TileCell | null }>>([]);
  const pendingCollisionCells = useRef<Map<string, boolean>>(new Map());
  const paintFlushScheduled = useRef(false);
  const collisionFlushScheduled = useRef(false);
