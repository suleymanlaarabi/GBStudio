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

export const copySelectionContent = (
  data: GBColor[][],
  selection: SelectionBounds,
) => extractSelection(data, selection);

export const cutSelectionContent = (
  data: GBColor[][],
  selection: SelectionBounds,
) => ({
  clipboard: extractSelection(data, selection),
  data: clearArea(data, selection),
});

export const pasteSelectionContent = (
  data: GBColor[][],
  clipboard: GBColor[][],
  x: number,
  y: number,
) => applySelectionContent(data, clipboard, x, y);

export const deleteSelectionContent = (
  data: GBColor[][],
  selection: SelectionBounds,
) => clearArea(data, selection);

export const moveSelectionContent = (
  data: GBColor[][],
  selection: SelectionBounds,
  deltaX: number,
  deltaY: number,
) => moveArea(data, selection, deltaX, deltaY);

// Extraction helper utilisé par les transformations
const extractSelectionData = (
  data: GBColor[][],
  selection: SelectionBounds,
): { extracted: GBColor[][]; startX: number; startY: number; endX: number; endY: number } | null => {
  const tileSize = data.length;
  const startX = Math.max(0, Math.min(selection.x, tileSize));
  const startY = Math.max(0, Math.min(selection.y, tileSize));
  const endX = Math.max(0, Math.min(selection.x + selection.width, tileSize));
  const endY = Math.max(0, Math.min(selection.y + selection.height, tileSize));

  if (startX >= endX || startY >= endY) return null;

  const extracted: GBColor[][] = [];
  for (let y = startY; y < endY; y++) {
    const row: GBColor[] = [];
    for (let x = startX; x < endX; x++) {
      row.push(data[y]![x]!);
    }
    extracted.push(row);
  }

  return { extracted, startX, startY, endX, endY };
};

export const flipSelectionHorizontal = (
  data: GBColor[][],
  selection: SelectionBounds,
): GBColor[][] | null => {
  const extractedInfo = extractSelectionData(data, selection);
  if (!extractedInfo) return null;

  const { extracted, startX, startY } = extractedInfo;
  const flipped = flipHorizontal(extracted);
  return applySelectionContent(data, flipped, startX, startY);
};

export const flipSelectionVertical = (
  data: GBColor[][],
  selection: SelectionBounds,
): GBColor[][] | null => {
  const extractedInfo = extractSelectionData(data, selection);
  if (!extractedInfo) return null;

  const { extracted, startX, startY } = extractedInfo;
  const flipped = flipVertical(extracted);
  return applySelectionContent(data, flipped, startX, startY);
};

export const rotateSelectionClockwise = (
  data: GBColor[][],
  selection: SelectionBounds,
): { data: GBColor[][]; newSelection: SelectionBounds } | null => {
  const extractedInfo = extractSelectionData(data, selection);
  if (!extractedInfo) return null;

  const { extracted, startX, startY } = extractedInfo;
  const rotated = rotateTileDataClockwise(extracted);

  const newData = applySelectionContent(data, rotated, startX, startY);
  const newSelection = {
    ...selection,
    x: startX,
    y: startY,
    width: selection.height,
    height: selection.width,
  };

  return { data: newData, newSelection };
};

export const rotateSelectionCounterClockwise = (
  data: GBColor[][],
  selection: SelectionBounds,
): { data: GBColor[][]; newSelection: SelectionBounds } | null => {
  const extractedInfo = extractSelectionData(data, selection);
  if (!extractedInfo) return null;

  const { extracted, startX, startY } = extractedInfo;
  const rotated = rotateTileDataCounterClockwise(extracted);

  const newData = applySelectionContent(data, rotated, startX, startY);
  const newSelection = {
    ...selection,
    x: startX,
    y: startY,
    width: selection.height,
    height: selection.width,
  };

  return { data: newData, newSelection };
};
