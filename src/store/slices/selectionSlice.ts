import type { StateCreator } from "zustand";
import type { GBColor, SelectionBounds, SelectionState, Tileset } from "../../types";
import { clearTileArea, fillTileArea } from "../../services/tileService";
import {
import { normalizeSelection, selectAll } from "../../utils";
  copySelectionContent,
  cutSelectionContent,
  deleteSelectionContent,
  moveSelectionContent,
  pasteSelectionContent,
  flipSelectionHorizontal as flipServiceSelectionHorizontal,
  flipSelectionVertical as flipServiceSelectionVertical,
  rotateSelectionClockwise as rotateServiceClockwise,
  rotateSelectionCounterClockwise as rotateServiceCounterClockwise,
} from "../../services/selectionService";

export interface SelectionSlice {
  selection: SelectionState;
  clipboard: (GBColor | null)[][] | null;
  beginSelection: (x: number, y: number) => void;
  updateSelection: (x: number, y: number) => void;
  endSelection: () => void;
  clearSelection: () => void;
  selectAll: () => void;
  copySelection: () => void;
  cutSelection: () => void;
  pasteSelection: (x: number, y: number) => void;
  deleteSelection: () => void;
  moveSelection: (deltaX: number, deltaY: number) => void;
  updateSelectionBounds: (x: number, y: number) => void;
  flipSelectionHorizontal: () => void;
  flipSelectionVertical: () => void;
  rotateSelectionClockwise: () => void;
  rotateSelectionCounterClockwise: () => void;
  fillArea: (
    tilesetIndex: number,
    tileIndex: number,
    selection: SelectionBounds,
    color: GBColor,
  ) => void;
  clearArea: (tilesetIndex: number, tileIndex: number, selection: SelectionBounds) => void;
}

type SelectionStoreState = SelectionSlice & {
  activeTileIndex: number;
  activeTilesetIndex: number;
  commit: () => void;
  tilesets: Tileset[];
