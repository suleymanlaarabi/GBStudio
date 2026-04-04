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
  stroke: string,
  fill?: string,
) => {
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(
      selection.x * unitSize,
      selection.y * unitSize,
      selection.width * unitSize,
      selection.height * unitSize,
    );
  }

  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(
    selection.x * unitSize,
    selection.y * unitSize,
    selection.width * unitSize,
    selection.height * unitSize,
  );
};

export const drawLineOverlay = (
  ctx: CanvasRenderingContext2D,
  start: CellCoords,
  end: CellCoords,
  unitSize: number,
) => {
  let x = start.x;
  let y = start.y;
  const dx = Math.abs(end.x - start.x);
  const sx = start.x < end.x ? 1 : -1;
  const dy = -Math.abs(end.y - start.y);
  const sy = start.y < end.y ? 1 : -1;
  let err = dx + dy;

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  while (true) {
    ctx.fillRect(x * unitSize, y * unitSize, unitSize, unitSize);
    if (x === end.x && y === end.y) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
