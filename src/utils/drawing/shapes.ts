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
    for (let px = 0; px < size; px++) {
      const dx = (px + 0.5 - centerX) / (radiusX + 0.5);
      const dy = (py + 0.5 - centerY) / (radiusY + 0.5);
      const dist = dx * dx + dy * dy;

      if (filled) {
        if (dist <= 1) newData[py]![px] = color;
      } else {
        const dxOuter = (px + 0.5 - centerX) / (radiusX + 0.5);
        const dyOuter = (py + 0.5 - centerY) / (radiusY + 0.5);
        const dxInner = (px + 0.5 - centerX) / (radiusX - 0.5);
        const dyInner = (py + 0.5 - centerY) / (radiusY - 0.5);
        if (dxOuter * dxOuter + dyOuter * dyOuter <= 1 &&
            dxInner * dxInner + dyInner * dyInner > 1) {
          newData[py]![px] = color;
        }
      }
    }
  }

  return newData;
}

export function drawRectangle(
  data: PixelData,
  x: number,
  y: number,
  width: number,
  height: number,
  color: GBColor,
  filled = true,
): PixelData {
  const newData = data.map((row) => [...row]);
  const tileSize = data.length;
  const startX = Math.max(0, Math.min(x, tileSize - 1));
  const startY = Math.max(0, Math.min(y, tileSize - 1));
  const endX = Math.max(0, Math.min(x + width, tileSize));
  const endY = Math.max(0, Math.min(y + height, tileSize));

  if (filled) {
    for (let py = startY; py < endY; py++) {
      for (let px = startX; px < endX; px++) {
        newData[py]![px] = color;
      }
    }
    return newData;
  }

  for (let px = startX; px < endX; px++) {
    if (startY >= 0 && startY < tileSize) newData[startY]![px] = color;
    if (endY - 1 >= 0 && endY - 1 < tileSize) newData[endY - 1]![px] = color;
  }

  for (let py = startY; py < endY; py++) {
    if (startX >= 0 && startX < tileSize) newData[py]![startX] = color;
    if (endX - 1 >= 0 && endX - 1 < tileSize) newData[py]![endX - 1] = color;
  }

  return newData;
}
