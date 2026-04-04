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
