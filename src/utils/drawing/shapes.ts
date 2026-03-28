import type { GBColor } from "../../types";

type PixelData = (GBColor | null)[][];

export function getCircleFromBounds(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
): { centerX: number; centerY: number; radiusX: number; radiusY: number } {
  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    radiusX: (maxX - minX) / 2,
    radiusY: (maxY - minY) / 2,
  };
}

export function drawCircle(
  data: PixelData,
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  color: GBColor,
  filled = true,
): PixelData {
  const newData = data.map((row) => [...row]);
  const size = data.length;

  for (let py = 0; py < size; py++) {
