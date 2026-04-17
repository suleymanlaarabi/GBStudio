import type { GBColor, SelectionBounds } from "../types";
import {
  applySelectionContent,
  clearArea,
  extractSelection,
  moveArea,
} from "../utils";
import {
  flipTileDataHorizontal as flipHorizontal,
  flipTileDataVertical as flipVertical,
  rotateTileDataClockwise,
  rotateTileDataCounterClockwise,
} from "../services/tileService";

type PixelData = (GBColor | null)[][];

export const copySelectionContent = (
  data: PixelData,
  selection: SelectionBounds,
) => extractSelection(data, selection);

export const cutSelectionContent = (
  data: PixelData,
  selection: SelectionBounds,
) => ({
  clipboard: extractSelection(data, selection),
  data: clearArea(data, selection),
});

export const pasteSelectionContent = (
  data: PixelData,
  clipboard: PixelData,
  x: number,
  y: number,
) => applySelectionContent(data, clipboard, x, y);

export const deleteSelectionContent = (
  data: PixelData,
  selection: SelectionBounds,
) => clearArea(data, selection);

export const moveSelectionContent = (
  data: PixelData,
  selection: SelectionBounds,
  deltaX: number,
  deltaY: number,
) => moveArea(data, selection, deltaX, deltaY);

const extractSelectionData = (
  data: PixelData,
  selection: SelectionBounds,
): { extracted: PixelData; startX: number; startY: number; endX: number; endY: number } | null => {
  const tileSize = data.length;
  const startX = Math.max(0, Math.min(selection.x, tileSize));
  const startY = Math.max(0, Math.min(selection.y, tileSize));
  const endX = Math.max(0, Math.min(selection.x + selection.width, tileSize));
  const endY = Math.max(0, Math.min(selection.y + selection.height, tileSize));

  if (startX >= endX || startY >= endY) return null;

  const extracted: PixelData = [];
  for (let y = startY; y < endY; y++) {
    const row: (GBColor | null)[] = [];
    for (let x = startX; x < endX; x++) {
      row.push(data[y]![x] ?? null);
    }
    extracted.push(row);
  }

  return { extracted, startX, startY, endX, endY };
};

export const flipSelectionHorizontal = (
  data: PixelData,
  selection: SelectionBounds,
): PixelData | null => {
  const info = extractSelectionData(data, selection);
  if (!info) return null;
  return applySelectionContent(data, flipHorizontal(info.extracted), info.startX, info.startY);
};

export const flipSelectionVertical = (
  data: PixelData,
  selection: SelectionBounds,
): PixelData | null => {
  const info = extractSelectionData(data, selection);
  if (!info) return null;
  return applySelectionContent(data, flipVertical(info.extracted), info.startX, info.startY);
};

export const rotateSelectionClockwise = (
  data: PixelData,
  selection: SelectionBounds,
): { data: PixelData; newSelection: SelectionBounds } | null => {
  const info = extractSelectionData(data, selection);
  if (!info) return null;
  const rotated = rotateTileDataClockwise(info.extracted);
  return {
    data: applySelectionContent(data, rotated, info.startX, info.startY),
    newSelection: { ...selection, x: info.startX, y: info.startY, width: selection.height, height: selection.width },
  };
};

export const rotateSelectionCounterClockwise = (
  data: PixelData,
  selection: SelectionBounds,
): { data: PixelData; newSelection: SelectionBounds } | null => {
  const info = extractSelectionData(data, selection);
  if (!info) return null;
  const rotated = rotateTileDataCounterClockwise(info.extracted);
  return {
    data: applySelectionContent(data, rotated, info.startX, info.startY),
    newSelection: { ...selection, x: info.startX, y: info.startY, width: selection.height, height: selection.width },
  };
};
