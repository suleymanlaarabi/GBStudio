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
