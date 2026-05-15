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
  const startY = Math.max(0, Math.min(selection.y, tileSize));
  const endX = Math.max(0, Math.min(selection.x + selection.width, tileSize));
  const endY = Math.max(0, Math.min(selection.y + selection.height, tileSize));

  const extracted: PixelData = [];
  for (let y = startY; y < endY; y++) {
    const row: (GBColor | null)[] = [];
    for (let x = startX; x < endX; x++) {
      row.push(data[y]![x] ?? null);
    }
    extracted.push(row);
  }

  return extracted;
}

export function applySelectionContent(
  data: PixelData,
  content: PixelData,
  targetX: number,
  targetY: number,
): PixelData {
  const newData = data.map((row) => [...row]);
  const tileSize = data.length;

  for (let y = 0; y < content.length; y++) {
    for (let x = 0; x < content[y]!.length; x++) {
      const destX = targetX + x;
      const destY = targetY + y;

      if (destX >= 0 && destX < tileSize && destY >= 0 && destY < tileSize) {
        newData[destY]![destX] = content[y]![x] ?? null;
      }
    }
  }

  return newData;
}

export function clearArea(
  data: PixelData,
  selection: SelectionBounds,
): PixelData {
  const newData = data.map((row) => [...row]);
  const tileSize = data.length;
  const startX = Math.max(0, Math.min(selection.x, tileSize));
  const startY = Math.max(0, Math.min(selection.y, tileSize));
  const endX = Math.max(0, Math.min(selection.x + selection.width, tileSize));
  const endY = Math.max(0, Math.min(selection.y + selection.height, tileSize));

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      newData[y]![x] = null;
    }
  }

  return newData;
}

export function moveArea(
  data: PixelData,
  selection: SelectionBounds,
  deltaX: number,
  deltaY: number,
): { data: PixelData; newSelection: SelectionBounds } | null {
  const tileSize = data.length;
  const newX = selection.x + deltaX;
  const newY = selection.y + deltaY;

  if (
    newX < 0 ||
    newY < 0 ||
    newX + selection.width > tileSize ||
    newY + selection.height > tileSize
  ) {
    return null;
  }

  const content = extractSelection(data, selection);
  const cleared = clearArea(data, selection);
  const movedData = applySelectionContent(cleared, content, newX, newY);

  return {
    data: movedData,
    newSelection: {
      x: newX,
      y: newY,
      width: selection.width,
      height: selection.height,
    },
  };
}

export const isPointInSelection = (
  x: number,
  y: number,
  selection: SelectionBounds,
) =>
  x >= selection.x &&
  x < selection.x + selection.width &&
  y >= selection.y &&
  y < selection.y + selection.height;

export const selectAll = (tileSize: number): SelectionBounds => ({
  x: 0,
  y: 0,
  width: tileSize,
  height: tileSize,
});
