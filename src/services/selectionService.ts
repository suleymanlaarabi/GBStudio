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

