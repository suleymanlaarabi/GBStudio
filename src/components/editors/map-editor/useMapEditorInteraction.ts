import { useState, useMemo } from "react";
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
    updateMapCell,
    clearMapCell,
    fillMap,
    drawMapLine,
    drawMapRectangle,
    mapTool,
    mapShapeFilled,
    beginMapSelection,
    updateMapSelection,
    endMapSelection,
    pickMapCell,
    commit,
  } = useStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<CellCoords | null>(null);
  const [hoverCell, setHoverCell] = useState<CellCoords | null>(null);

  const activeCell = useMemo<TileCell | null>(() => {
    if (!activeTileset) return null;
    return { tilesetId: activeTileset.id, tileIndex: activeTileIndex };
  }, [activeTileIndex, activeTileset]);

  const handlePaint = (coords: CellCoords) => {
    if (!map || !activeTileset || !activeCell) return;

    if (mapTool === "pencil") {
      updateMapCell(
        activeMapIndex,
        coords.x,
        coords.y,
        activeCell.tilesetId,
        activeCell.tileIndex,
      );
    } else if (mapTool === "eraser") {
      clearMapCell(activeMapIndex, coords.x, coords.y);
    }
  };

  const handleMouseDown = (coords: CellCoords) => {
    if (!map) return;

    setHoverCell(coords);

    if (mapTool === "eyedropper") {
      pickMapCell(activeMapIndex, coords.x, coords.y);
      return;
    }

    if (mapTool === "fill" && activeCell) {
      fillMap(
        activeMapIndex,
        coords.x,
        coords.y,
        activeCell.tilesetId,
        activeCell.tileIndex,
      );
      return;
    }

    if (mapTool === "line" || mapTool === "rectangle" || mapTool === "select") {
      setIsDrawing(true);
      setDragStart(coords);
      if (mapTool === "select") beginMapSelection(coords.x, coords.y);
      return;
    }

    setIsDrawing(true);
    handlePaint(coords);
  };

  const handleMouseMove = (coords: CellCoords | null) => {
    setHoverCell(coords);
    if (!coords || !isDrawing) return;

    if (mapTool === "select") {
      updateMapSelection(coords.x, coords.y);
      return;
    }

    if (mapTool === "line" || mapTool === "rectangle") return;
    handlePaint(coords);
  };

  const handleMouseUp = () => {
    if (!map || !dragStart || !hoverCell) {
      setIsDrawing(false);
      setDragStart(null);
      return;
    }

    // "Commit" logic
    if (mapTool === "line") {
      drawMapLine(
        activeMapIndex,
        dragStart.x,
        dragStart.y,
        hoverCell.x,
        hoverCell.y,
        activeCell,
      );
    } else if (mapTool === "rectangle") {
      drawMapRectangle(
        activeMapIndex,
        normalizeBounds(dragStart, hoverCell),
        activeCell,
        mapShapeFilled,
      );
    } else if (mapTool === "select") {
      endMapSelection();
    }

    if (mapTool === "pencil" || mapTool === "eraser") {
      commit();
    }

    setIsDrawing(false);
    setDragStart(null);
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
    setDragStart(null);
    setHoverCell(null);
  };

  return {
    isDrawing,
    dragStart,
    hoverCell,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
  };
};
