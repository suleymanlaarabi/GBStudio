import type { GBColor, SelectionBounds } from "../../types";
import { drawRectangle } from "./shapes";

export function floodFillData(
  data: GBColor[][],
  startX: number,
  startY: number,
  targetColor: GBColor,
): GBColor[][] {
  const newData = data.map((row) => [...row]);
  const tileSize = data.length;
  const startColor = newData[startY]?.[startX];

  if (startColor === undefined || startColor === targetColor) {
    return newData;
  }

  const fill = (x: number, y: number) => {
    if (
      x < 0 ||
      x >= tileSize ||
      y < 0 ||
      y >= tileSize ||
      newData[y]![x] !== startColor
    ) {
      return;
    }

    newData[y]![x] = targetColor;
    fill(x + 1, y);
    fill(x - 1, y);
    fill(x, y + 1);
    fill(x, y - 1);
  };

  fill(startX, startY);
  return newData;
}

export const fillArea = (
  data: GBColor[][],
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
