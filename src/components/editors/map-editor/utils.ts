import type { MapTool, SelectionBounds } from "../../../types";
import type { CellCoords } from "./types";

export const normalizeBounds = (
  start: CellCoords,
  end: CellCoords,
): SelectionBounds => ({
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
  width: Math.abs(end.x - start.x) + 1,
  height: Math.abs(end.y - start.y) + 1,
});

export const drawSelectionOverlay = (
  ctx: CanvasRenderingContext2D,
  selection: SelectionBounds,
  unitSize: number,
