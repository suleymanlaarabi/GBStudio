import type { GBColor, SelectionBounds } from "../../types";

type PixelData = (GBColor | null)[][];

export const normalizeSelection = (
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
): SelectionBounds => ({
  x: Math.min(startX, currentX),
  y: Math.min(startY, currentY),
  width: Math.abs(currentX - startX) + 1,
  height: Math.abs(currentY - startY) + 1,
});

export function extractSelection(
  data: PixelData,
  selection: SelectionBounds,
): PixelData {
  const tileSize = data.length;
  const startX = Math.max(0, Math.min(selection.x, tileSize));
