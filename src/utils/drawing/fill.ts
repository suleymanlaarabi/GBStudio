import type { GBColor, SelectionBounds } from "../../types";
import { drawRectangle } from "./shapes";

type PixelData = (GBColor | null)[][];

export function floodFillData(
  data: PixelData,
  startX: number,
  startY: number,
  targetColor: GBColor,
): PixelData {
  const newData = data.map((row) => [...row]);
  const tileSize = data.length;
  const startColor = newData[startY]?.[startX] ?? null;

  if (startColor === targetColor) return newData;

  const stack: Array<[number, number]> = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    if (x < 0 || x >= tileSize || y < 0 || y >= tileSize) continue;
    if ((newData[y]![x] ?? null) !== startColor) continue;

    newData[y]![x] = targetColor;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  return newData;
}

export const fillArea = (
  data: PixelData,
  selection: SelectionBounds,
  color: GBColor,
) =>
  drawRectangle(
    data,
    selection.x,
    selection.y,
    selection.width,
    selection.height,
    color,
    true,
  );
