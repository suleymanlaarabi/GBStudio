import type { GBColor } from "../../types";

export function drawRectangle(
  data: GBColor[][],
  x: number,
  y: number,
  width: number,
  height: number,
  color: GBColor,
  filled = true,
): GBColor[][] {
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

export function drawCircle(
  data: GBColor[][],
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  color: GBColor,
  filled = true,
): GBColor[][] {
  const newData = data.map((row) => [...row]);
  const tileSize = data.length;
  const radius = Math.max(radiusX, radiusY);

  if (filled) {
    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        if (Math.sqrt(dx * dx + dy * dy) <= radius) {
          newData[y]![x] = color;
        }
      }
    }
    return newData;
  }

  for (let angle = 0; angle < 360; angle += 1) {
    const rad = (angle * Math.PI) / 180;
    const x = Math.round(centerX + radius * Math.cos(rad));
    const y = Math.round(centerY + radius * Math.sin(rad));

    if (x >= 0 && x < tileSize && y >= 0 && y < tileSize) {
      newData[y]![x] = color;
    }
  }

  return newData;
}

export const getCircleFromBounds = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
) => {
  const minX = Math.min(startX, endX);
  const maxX = Math.max(startX, endX);
  const minY = Math.min(startY, endY);
  const maxY = Math.max(startY, endY);
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;

  return {
    centerX: minX + Math.floor(width / 2),
    centerY: minY + Math.floor(height / 2),
    radiusX: Math.floor(width / 2),
    radiusY: Math.floor(height / 2),
  };
};
