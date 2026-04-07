import type { GBColor, SelectionBounds } from "../types";
import {
import {
  applySelectionContent,
  clearArea,
  extractSelection,
  moveArea,
} from "../utils";
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
