import type { GBColor, SelectionBounds } from "../../types";

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
  data: GBColor[][],
  selection: SelectionBounds,
): GBColor[][] {
  const tileSize = data.length;
  const startX = Math.max(0, Math.min(selection.x, tileSize));
  const startY = Math.max(0, Math.min(selection.y, tileSize));
  const endX = Math.max(0, Math.min(selection.x + selection.width, tileSize));
  const endY = Math.max(0, Math.min(selection.y + selection.height, tileSize));

  const extracted: GBColor[][] = [];
  for (let y = startY; y < endY; y++) {
    const row: GBColor[] = [];
    for (let x = startX; x < endX; x++) {
      row.push(data[y]![x]!);
    }
    extracted.push(row);
  }

  return extracted;
}

export function applySelectionContent(
  data: GBColor[][],
  content: GBColor[][],
  targetX: number,
  targetY: number,
  blendMode: "replace" | "add" = "replace",
): GBColor[][] {
  const newData = data.map((row) => [...row]);
  const tileSize = data.length;

  for (let y = 0; y < content.length; y++) {
    for (let x = 0; x < content[y]!.length; x++) {
      const destX = targetX + x;
      const destY = targetY + y;

      if (destX >= 0 && destX < tileSize && destY >= 0 && destY < tileSize) {
        if (blendMode === "replace" || content[y]![x] !== 0) {
          newData[destY]![destX] = content[y]![x]!;
        }
      }
    }
  }

  return newData;
}

export function clearArea(
  data: GBColor[][],
  selection: SelectionBounds,
): GBColor[][] {
  const newData = data.map((row) => [...row]);
  const tileSize = data.length;
  const startX = Math.max(0, Math.min(selection.x, tileSize));
  const startY = Math.max(0, Math.min(selection.y, tileSize));
  const endX = Math.max(0, Math.min(selection.x + selection.width, tileSize));
  const endY = Math.max(0, Math.min(selection.y + selection.height, tileSize));

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      newData[y]![x] = 0;
    }
  }

  return newData;
}

export function moveArea(
  data: GBColor[][],
  selection: SelectionBounds,
  deltaX: number,
  deltaY: number,
): { data: GBColor[][]; newSelection: SelectionBounds } | null {
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
