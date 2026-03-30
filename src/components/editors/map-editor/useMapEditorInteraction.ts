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

  const activeCell = useMemo<TileCell | null>(() => {
    if (!activeTileset) return null;
    return { tilesetId: activeTileset.id, tileIndex: activeTileIndex };
  }, [activeTileIndex, activeTileset]);

  const flushPaintCells = (cells: Array<{ x: number; y: number; cell: TileCell | null }>) => {
    if (cells.length === 0) return;
    if (useStore.getState().activeLayerIsWindow) {
      batchUpdateWindowCells(activeMapIndex, cells);
    } else {
      batchUpdateMapCells(activeMapIndex, cells);
    }
  };

  const schedulePaintFlush = () => {
    if (paintFlushScheduled.current) return;
    paintFlushScheduled.current = true;
    requestAnimationFrame(() => {
      if (!paintFlushScheduled.current) return; // cancelled by flushAll
      const cells = pendingPaintCells.current.splice(0);
      flushPaintCells(cells);
      paintFlushScheduled.current = false;
    });
  };

  const scheduleCollisionFlush = () => {
    if (collisionFlushScheduled.current) return;
    collisionFlushScheduled.current = true;
    requestAnimationFrame(() => {
      if (!collisionFlushScheduled.current) return; // cancelled by flushAll
      const cells = Array.from(pendingCollisionCells.current.entries()).map(([key, solid]) => {
        const [xStr, yStr] = key.split(",");
        return { x: Number(xStr), y: Number(yStr), solid };
      });
      if (cells.length > 0) batchSetCollisionCells(activeMapIndex, cells);
      pendingCollisionCells.current.clear();
      collisionFlushScheduled.current = false;
    });
  };

  // Synchronous flush — called on mouseUp/mouseLeave to commit all buffered cells immediately
  const flushAll = () => {
    paintFlushScheduled.current = false;
    collisionFlushScheduled.current = false;

    const paintCells = pendingPaintCells.current.splice(0);
